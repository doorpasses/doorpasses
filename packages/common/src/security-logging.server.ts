/**
 * Enhanced Security Logging
 * Implements structured logging for security events as recommended by OWASP
 */

import pino from 'pino'

// Security event types for structured logging
export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  SSO_CONFIG_CHANGED = 'sso_config_changed',
  OIDC_DISCOVERY_FAILED = 'oidc_discovery_failed',
  SSRF_ATTEMPT_DETECTED = 'ssrf_attempt_detected',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  CONFIGURATION_CHANGE = 'configuration_change',
  PERMISSION_DENIED = 'permission_denied'
}

// Security event severity levels
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Base security event interface
export interface SecurityEvent {
  type: SecurityEventType
  severity: SecurityEventSeverity
  timestamp: string
  userId?: string
  organizationId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  details?: Record<string, any>
  riskScore?: number
  mitigationApplied?: string[]
}

/**
 * Create security logger instance
 * Only logs to console in development, to files/services in production
 */
const securityLogger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      '*.password',
      '*.token',
      '*.secret',
      '*.key',
      '*.authorization',
      '*.cookie',
      'details.password',
      'details.token',
      'details.secret',
      'details.key',
      'details.authorization',
      'details.cookie'
    ],
    remove: true
  },
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined
})

/**
 * Log security events with structured data
 */
function logSecurityEvent(event: SecurityEvent): void {
  // Only log non-sensitive information
  const safeEvent = {
    ...event,
    // Ensure no sensitive data is logged
    details: sanitizeEventDetails(event.details),
    // Add environment context (but no sensitive data)
    environment: process.env.NODE_ENV || 'unknown',
    version: process.env.npm_package_version || 'unknown'
  }

  // Add structured metadata
  const logData = {
    securityEvent: true,
    ...safeEvent
  }

  // Log based on severity level
  switch (event.severity) {
    case SecurityEventSeverity.CRITICAL:
      securityLogger.error(logData, `CRITICAL: ${event.type}`)
      break
    case SecurityEventSeverity.HIGH:
      securityLogger.error(logData, `HIGH: ${event.type}`)
      break
    case SecurityEventSeverity.MEDIUM:
      securityLogger.warn(logData, `MEDIUM: ${event.type}`)
      break
    case SecurityEventSeverity.LOW:
    default:
      securityLogger.info(logData, `LOW: ${event.type}`)
      break
  }
}

/**
 * Sanitize event details to remove sensitive information
 */
function sanitizeEventDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'authorization', 'cookie',
    'ssn', 'credit_card', 'api_key', 'access_token', 'refresh_token',
    'client_secret', 'private_key', 'client_private_key'
  ]

  const sanitized = { ...details }

  for (const [key, value] of Object.entries(sanitized)) {
    const isSensitiveKey = sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    )

    if (isSensitiveKey) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeEventDetails(value as Record<string, any>)
    }
  }

  return sanitized
}

/**
 * Get client information safely
 */
function getClientInfo(req: any): { ipAddress?: string; userAgent?: string } {
  try {
    const ipAddress = req.ip || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress ||
                     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.headers['x-real-ip'] ||
                     'unknown'

    const userAgent = req.get('User-Agent') || 'unknown'

    return { ipAddress, userAgent }
  } catch (error) {
    return { ipAddress: 'unknown', userAgent: 'unknown' }
  }
}

/**
 * Security event logging functions
 */

// Authentication events
export function logAuthenticationSuccess(
  req: any,
  userId: string,
  additionalDetails?: Record<string, any>
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  logSecurityEvent({
    type: SecurityEventType.AUTHENTICATION_SUCCESS,
    severity: SecurityEventSeverity.LOW,
    timestamp: new Date().toISOString(),
    userId,
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      method: req.method,
      success: true,
      ...additionalDetails
    }
  })
}

export function logAuthenticationFailure(
  req: any,
  reason: string,
  userId?: string,
  additionalDetails?: Record<string, any>
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  logSecurityEvent({
    type: SecurityEventType.AUTHENTICATION_FAILURE,
    severity: SecurityEventSeverity.MEDIUM,
    timestamp: new Date().toISOString(),
    userId,
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      method: req.method,
      reason,
      success: false,
      ...additionalDetails
    },
    riskScore: calculateRiskScore(req, { reason, userId })
  })
}

// OIDC/SSO events
export function logOIDCDiscoveryFailure(
  req: any,
  issuerUrl: string,
  error: string,
  details?: Record<string, any>
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  // Don't log the actual issuer URL for privacy/security
  const sanitizedIssuerUrl = sanitizeUrl(issuerUrl)
  
  logSecurityEvent({
    type: SecurityEventType.OIDC_DISCOVERY_FAILED,
    severity: SecurityEventSeverity.HIGH,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      issuerUrl: sanitizedIssuerUrl,
      error: error.length > 100 ? `${error.substring(0, 97)}...` : error,
      method: req.method,
      ...details
    },
    riskScore: details?.ssrfAttempt ? 90 : 30
  })
}

// SSRF protection events
export function logSSRFAttempt(
  req: any,
  maliciousUrl: string,
  detectionReason: string,
  mitigationApplied: string[] = []
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  logSecurityEvent({
    type: SecurityEventType.SSRF_ATTEMPT_DETECTED,
    severity: SecurityEventSeverity.CRITICAL,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      maliciousUrl: sanitizeUrl(maliciousUrl),
      detectionReason,
      method: req.method,
      isPotentialAttack: true
    },
    riskScore: 100,
    mitigationApplied
  })
}

// Rate limiting events
export function logRateLimitExceeded(
  req: any,
  limitType: string,
  windowMs: number,
  maxRequests: number
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    severity: SecurityEventSeverity.MEDIUM,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      limitType,
      windowMs,
      maxRequests,
      method: req.method
    },
    riskScore: 40
  })
}

// Configuration change events
export function logSSOConfigChanged(
  req: any,
  organizationId: string,
  changes: Record<string, any>
): void {
  const { ipAddress, userAgent } = getClientInfo(req)
  
  logSecurityEvent({
    type: SecurityEventType.SSO_CONFIG_CHANGED,
    severity: SecurityEventSeverity.HIGH,
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    organizationId,
    ipAddress,
    userAgent,
    endpoint: req.path,
    details: {
      changes: sanitizeConfigChanges(changes),
      method: req.method
    },
    mitigationApplied: ['validation_required']
  })
}

/**
 * Calculate risk score based on various factors
 */
function calculateRiskScore(req: any, context: { reason?: string; userId?: string }): number {
  let score = 10 // Base score

  // Increase score based on authentication failure reason
  if (context.reason?.includes('invalid')) score += 20
  if (context.reason?.includes('expired')) score += 15
  if (context.reason?.includes('locked')) score += 30

  // Increase score if no user ID (potential attacker)
  if (!context.userId) score += 25

  // Increase score based on frequency (could be implemented with Redis)
  // This is a simplified version

  return Math.min(score, 100)
}

/**
 * Sanitize URL for logging
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Only log domain, not full URL
    return urlObj.hostname
  } catch {
    // If URL parsing fails, just mask it
    return '[INVALID_URL]'
  }
}

/**
 * Sanitize configuration changes for logging
 */
function sanitizeConfigChanges(changes: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(changes)) {
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token')) {
      sanitized[key] = '[REDACTED]'
    } else if (key.toLowerCase().includes('url') && typeof value === 'string') {
      sanitized[key] = sanitizeUrl(value)
    } else {
      sanitized[key] = typeof value === 'string' && value.length > 100 
        ? `${value.substring(0, 97)}...` 
        : value
    }
  }
  
  return sanitized
}

export { securityLogger }