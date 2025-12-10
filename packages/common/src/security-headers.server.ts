/**
 * Security Headers Configuration
 * Implements OWASP recommended security headers to prevent common attacks
 */

import type { HeadersArgs } from 'react-router'

export interface SecurityHeadersConfig {
  csp?: {
    enabled: boolean
    nonce?: string
  }
  strictTransportSecurity?: boolean
  xFrameOptions?: 'DENY' | 'SAMEORIGIN'
  xContentTypeOptions?: 'nosniff'
  xXSSProtection?: '0' | '1' | 'mode=block'
  referrerPolicy?: string
  permissionsPolicy?: string
  crossOriginEmbedderPolicy?: string
  crossOriginOpenerPolicy?: string
  crossOriginResourcePolicy?: string
}

/**
 * Default security headers configuration
 */
const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  csp: {
    enabled: true,
  },
  strictTransportSecurity: true,
  xFrameOptions: 'SAMEORIGIN',
  xContentTypeOptions: 'nosniff',
  xXSSProtection: '0', // XSS protection disabled as modern browsers use CSP
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'geolocation=(), microphone=(), camera=(), payment=()',
  crossOriginEmbedderPolicy: 'require-corp',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
}

/**
 * Generate Content Security Policy with nonce support
 */
function generateCSP(config: SecurityHeadersConfig): string {
  if (!config.csp?.enabled) return ''

  const cspDirectives: string[] = []

  // Default-src: Only allow resources from same origin
  cspDirectives.push("default-src 'self'")

  // Script-src: Allow scripts from same origin with nonce
  if (config.csp.nonce) {
    cspDirectives.push(`script-src 'self' 'nonce-${config.csp.nonce}'`)
  } else {
    cspDirectives.push("script-src 'self'")
  }

  // Style-src: Allow styles from same origin and inline
  cspDirectives.push("style-src 'self' 'unsafe-inline'")

  // Image-src: Allow images from same origin and data URLs
  cspDirectives.push("img-src 'self' data: blob:")

  // Font-src: Allow fonts from same origin
  cspDirectives.push("font-src 'self'")

  // Connect-src: Allow connections to same origin and API endpoints
  cspDirectives.push("connect-src 'self' wss: https:")

  // Frame-src: Disallow embedding by default
  cspDirectives.push("frame-src 'none'")

  // Object-src: Block Flash and other plugins
  cspDirectives.push("object-src 'none'")

  // Media-src: Allow media from same origin
  cspDirectives.push("media-src 'self'")

  // Worker-src: Allow workers from same origin
  cspDirectives.push("worker-src 'self'")

  // Manifest-src: Allow manifests from same origin
  cspDirectives.push("manifest-src 'self'")

  // Base-uri: Restrict base URI to same origin
  cspDirectives.push("base-uri 'self'")

  // Form-action: Restrict form submissions to same origin
  cspDirectives.push("form-action 'self'")

  // Block mixed content
  cspDirectives.push("upgrade-insecure-requests")

  // Prevent MIME type sniffing
  cspDirectives.push("object-src 'none'")

  return cspDirectives.join('; ')
}

/**
 * Apply security headers to route responses
 * Compatible with React Router's HeadersArgs interface
 */
export function applySecurityHeaders({
  parentHeaders,
  loaderHeaders,
  actionHeaders,
  errorHeaders,
}: HeadersArgs, config?: Partial<SecurityHeadersConfig>): Headers {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
  const securityHeaders = new Headers()

  // Content Security Policy
  if (finalConfig.csp?.enabled) {
    const csp = generateCSP(finalConfig)
    if (csp) {
      securityHeaders.set('Content-Security-Policy', csp)
    }
  }

  // HTTP Strict Transport Security
  if (finalConfig.strictTransportSecurity) {
    securityHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // X-Frame-Options
  if (finalConfig.xFrameOptions) {
    securityHeaders.set('X-Frame-Options', finalConfig.xFrameOptions)
  }

  // X-Content-Type-Options
  if (finalConfig.xContentTypeOptions) {
    securityHeaders.set('X-Content-Type-Options', finalConfig.xContentTypeOptions)
  }

  // X-XSS-Protection (deprecated but still recommended for older browsers)
  if (finalConfig.xXSSProtection) {
    securityHeaders.set('X-XSS-Protection', finalConfig.xXSSProtection)
  }

  // Referrer-Policy
  if (finalConfig.referrerPolicy) {
    securityHeaders.set('Referrer-Policy', finalConfig.referrerPolicy)
  }

  // Permissions-Policy
  if (finalConfig.permissionsPolicy) {
    securityHeaders.set('Permissions-Policy', finalConfig.permissionsPolicy)
  }

  // Cross-Origin Embedder Policy
  if (finalConfig.crossOriginEmbedderPolicy) {
    securityHeaders.set('Cross-Origin-Embedder-Policy', finalConfig.crossOriginEmbedderPolicy)
  }

  // Cross-Origin Opener Policy
  if (finalConfig.crossOriginOpenerPolicy) {
    securityHeaders.set('Cross-Origin-Opener-Policy', finalConfig.crossOriginOpenerPolicy)
  }

  // Cross-Origin Resource Policy
  if (finalConfig.crossOriginResourcePolicy) {
    securityHeaders.set('Cross-Origin-Resource-Policy', finalConfig.crossOriginResourcePolicy)
  }

  // Additional security headers for OIDC/OAuth flows
  securityHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  securityHeaders.set('Pragma', 'no-cache')
  securityHeaders.set('Expires', '0')

  return securityHeaders
}

/**
 * Get security headers for specific use cases
 */
export const SecurityHeaderSets = {
  // Basic security headers for all pages
  basic: (config?: Partial<SecurityHeadersConfig>) => ({
    csp: { enabled: true },
    ...config
  }),

  // Enhanced security for authentication pages
  authentication: (nonce?: string, config?: Partial<SecurityHeadersConfig>) => ({
    csp: { enabled: true, nonce },
    strictTransportSecurity: true,
    xFrameOptions: 'DENY', // Prevent clickjacking on auth pages
    xContentTypeOptions: 'nosniff',
    xXSSProtection: '0',
    referrerPolicy: 'no-referrer', // Prevent referrer leakage on auth pages
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    ...config
  }),

  // API endpoint security
  api: (config?: Partial<SecurityHeadersConfig>) => ({
    csp: { enabled: false }, // CSP not needed for API responses
    strictTransportSecurity: true,
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'no-referrer',
    ...config
  }),

  // Static assets security
  static: (config?: Partial<SecurityHeadersConfig>) => ({
    csp: { enabled: false },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    crossOriginResourcePolicy: 'cross-origin', // Allow cross-origin resource sharing
    ...config
  })
}

/**
 * Middleware for applying security headers to Express routes
 */
export function securityHeadersMiddleware(
  config?: Partial<SecurityHeadersConfig>
) {
  return (req: any, res: any, next: any) => {
    const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
    const headers = applySecurityHeaders({
      parentHeaders: new Headers(),
      loaderHeaders: new Headers(),
      actionHeaders: new Headers(),
      errorHeaders: new Headers(),
    }, finalConfig)

    // Apply headers to Express response
    headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    next()
  }
}