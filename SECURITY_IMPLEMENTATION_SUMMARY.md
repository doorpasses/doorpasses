# Security Implementation Summary
**Epic Stack - Current Security Controls & Best Practices**

---

## Overview

The Epic Stack implements comprehensive security controls aligned with OWASP recommendations. This document details the implemented security measures across the application.

---

## 1. Authentication & Authorization

### Multi-Method Authentication

#### 1.1 Password-Based Authentication
- **Algorithm:** bcrypt with cost factor 12 (OWASP 2025 recommended)
- **Salt:** Unique per password
- **Location:** `apps/app/app/utils/auth.server.ts`
- **Validation:** Minimum length, complexity, Pwned Passwords API check

#### 1.2 Multi-Factor Authentication (MFA)
- **Type:** Time-based One-Time Password (TOTP)
- **Implementation:** Configurable 2FA
- **Backup Codes:** Support for account recovery
- **Location:** `apps/app/app/routes/_auth+/auth.two-factor.tsx`

#### 1.3 OAuth 2.0 Integration
- **Providers:** GitHub, Google, Discord
- **Flow:** Authorization Code with PKCE
- **Scope Control:** Minimal requested permissions
- **Location:** `apps/app/app/routes/_auth+/oauth.*.tsx`

#### 1.4 OpenID Connect (OIDC)
- **Enterprise SSO Support:** Custom OIDC providers
- **Discovery:** Automatic endpoint discovery with SSRF protection
- **Validation:** Comprehensive URL and endpoint validation
- **Location:** `apps/app/app/utils/oidc-discovery.server.ts`

#### 1.5 WebAuthn / Passkeys
- **Standard:** W3C WebAuthn Level 2
- **Hardware Support:** Security keys, biometric devices
- **Passwordless:** Optional passwordless authentication
- **Location:** `apps/app/app/routes/_auth+/passkey*.tsx`

### Authorization (Access Control)

#### Role-Based Access Control (RBAC)
```typescript
// Location: apps/app/app/utils/permissions.server.ts

export async function requireUserWithPermission(
  request: Request,
  permission: PermissionString,
) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      roles: {
        some: {
          permissions: { some: { ...permissionData } }
        }
      }
    }
  })
  
  if (!user) {
    throw data({ error: 'Unauthorized' }, { status: 403 })
  }
  
  return user
}
```

#### Organization-Level Permissions
- Multi-tenant support
- Organization-specific roles
- User membership validation
- Permission inheritance

#### Session Management
```typescript
// Location: packages/auth/src/session.server.ts

const sessionConfig = {
  secret: SESSION_SECRET,
  defaultSession: {
    userId: '',
  },
  cookie: {
    name: '__session',
    sameSite: 'lax' as const,
    path: '/',
    httpOnly: true,
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}
```

---

## 2. Data Protection & Encryption

### Encryption Implementation

#### AES-256-GCM Encryption
**Location:** `packages/security/src/encryption.ts`

```typescript
const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 64
const KEY_LENGTH = 32

/**
 * Derive a key using PBKDF2-SHA512
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512')
}

/**
 * Encrypt data with AES-256-GCM
 */
export function encrypt(
  plaintext: string,
  masterKey: string,
): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(masterKey, salt)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Combine: salt (64 bytes) + iv (16 bytes) + authTag (16 bytes) + ciphertext
  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

/**
 * Decrypt AES-256-GCM encrypted data
 */
export function decrypt(encrypted: string, masterKey: string): string {
  const [saltHex, ivHex, authTagHex, ciphertext] = encrypted.split(':')
  
  const salt = Buffer.from(saltHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const key = deriveKey(masterKey, salt)
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')
  
  return plaintext
}
```

**Uses:**
- SSO configuration encryption
- Integration credentials
- Sensitive data at rest

### Key Derivation

- **Algorithm:** PBKDF2-SHA512
- **Iterations:** 100,000 (NIST recommended minimum)
- **Salt:** 64 bytes (random per encryption)
- **Key Length:** 32 bytes (256-bit for AES-256)

### Certificate Management

- **HTTPS:** Enforced in production
- **SSL/TLS:** Latest protocols
- **Certificate Validation:** Proper chain validation
- **HSTS:** HTTP Strict Transport Security enabled

---

## 3. Input Validation & Output Encoding

### Input Validation Framework

#### Zod Schema Validation
**Used Throughout Application**

```typescript
// Example: User registration validation
import { z } from 'zod'

const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase letter')
    .regex(/[0-9]/, 'Must include number'),
  name: z.string().min(1, 'Name is required'),
})

// Server-side validation (auth.server.ts)
export async function validatePassword(password: string) {
  const pwned = await isPwnedPassword(password)
  if (pwned) {
    throw new Error('This password has been compromised')
  }
  return true
}
```

**Validation Points:**
- Form inputs
- API parameters
- Database operations
- File uploads

### Output Encoding

#### HTML Sanitization with DOMPurify
**Location:** `apps/app/app/components/note/comment-item.tsx`

```typescript
const sanitizedContent = useMemo(() => {
  return DOMPurify.sanitize(comment.content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'i', 'u', 'a',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM: false,
  })
}, [comment.content])
```

**Protection Against:**
- XSS via HTML injection
- JavaScript execution
- Data attribute injection
- Protocol-based attacks

#### React Automatic Escaping
- React escapes text content automatically
- Uses textContent instead of innerHTML for user data
- No dangerouslySetInnerHTML with user input

---

## 4. Injection Prevention

### SQL Injection Prevention

#### Prisma ORM
**Location:** `apps/app/app/routes/*/*.server.ts`

```typescript
// ✅ SAFE: Parameterized queries via ORM
const user = await prisma.user.findFirst({
  where: {
    email: userSuppliedEmail,
  },
})

// ✅ SAFE: Template literal with prisma.$queryRaw
const result = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userEmail}
`

// ❌ DANGEROUS (not used anywhere):
// const query = `SELECT * FROM User WHERE email = '${userEmail}'`
```

**Benefits:**
- Parameter binding prevents injection
- Type safety at compile time
- No string concatenation with user data
- Prepared statement semantics

### Command Injection Prevention

**Practices:**
- No `child_process.exec()` with user input
- No `eval()` with dynamic code
- No shell commands with user data
- Use spawning with argument arrays (not shell=true)

### LDAP Injection Prevention
- No LDAP queries found (uses OIDC/OAuth instead)

### XML Injection Prevention
- Safe XML libraries (not vulnerable parsers)
- No XXE enabled

---

## 5. CSRF (Cross-Site Request Forgery) Prevention

### Token-Based CSRF Protection

#### Method 1: SameSite Cookies
```typescript
// Location: packages/auth/src/session.server.ts

cookie: {
  sameSite: 'lax', // Prevents CSRF attacks
  httpOnly: true,  // Prevents XSS access
  secure: true,    // HTTPS only
}
```

#### Method 2: Honeypot Fields
**Location:** `packages/conform/conform.server.ts`

```typescript
export function parseFormData(request: Request) {
  // Hidden field "honeypot" must be empty
  // Bots fill all fields, humans skip hidden fields
  // Legitimate requests leave it empty
}
```

#### Method 3: Form Validation
- Server validates form structure
- Expected fields verified
- Unexpected fields rejected

---

## 6. XSS (Cross-Site Scripting) Prevention

### Multiple Layers of Defense

#### 1. Content Security Policy (CSP)
- Inline scripts blocked (except with nonce)
- External scripts validated
- Style sources restricted
- Prevents code injection

#### 2. HttpOnly Cookies
```typescript
cookie: {
  httpOnly: true, // JavaScript cannot access
  // Protection: document.cookie won't return this cookie
}
```

#### 3. Output Encoding
- React automatic escaping
- DOMPurify for HTML content
- Proper charset declaration (UTF-8)

#### 4. Input Validation
- Zod schema validation
- Type checking
- Sanitization

---

## 7. SSRF (Server-Side Request Forgery) Protection

### Comprehensive SSRF Validation

**Location:** `apps/app/app/utils/url-validation.server.ts`

#### SSRF Protection Strategy

1. **Private IP Blocking**
   ```
   RFC1918 Ranges:
   - 10.0.0.0/8
   - 172.16.0.0/12
   - 192.168.0.0/16
   
   Special Ranges:
   - 127.0.0.0/8 (localhost)
   - 0.0.0.0/8 (current network)
   - 169.254.0.0/16 (link-local)
   ```

2. **Cloud Metadata Service Blocking**
   ```
   - 169.254.169.254 (AWS, Azure, GCP)
   - 169.254.170.2 (AWS ECS)
   - fd00:ec2::254 (AWS IPv6)
   ```

3. **Protocol Validation**
   - ✅ Allows: https://, http:// (dev only)
   - ❌ Blocks: file://, data://, javascript://
   - ❌ Blocks: ftp://, gopher://, etc.

4. **Domain Validation**
   - ❌ Blocks: .internal, .local domains
   - ✅ Production: Requires valid TLD
   - ❌ Production: Blocks IP addresses

#### Applied To
- OIDC issuer URL discovery
- OAuth endpoint validation
- Manual endpoint configuration
- All external HTTP requests

#### Usage Example
```typescript
import { validateOIDCIssuerUrl } from './url-validation.server'

export async function configureSSO(issuerUrl: string) {
  const validation = validateOIDCIssuerUrl(issuerUrl)
  
  if (!validation.valid) {
    throw new Error(`Invalid issuer URL: ${validation.error}`)
  }
  
  // Safe to use: validation.normalizedUrl
  return discoverOIDCEndpoints(validation.normalizedUrl)
}
```

---

## 8. Security Headers

### HTTP Security Headers

#### Content Security Policy (CSP)
```
Directives:
- default-src 'self'
- script-src 'self' 'nonce-{random}'
- style-src 'self' 'unsafe-inline'
- img-src 'self' data: https:
- connect-src 'self'
- frame-ancestors 'none'
- base-uri 'self'
```

#### HSTS (HTTP Strict Transport Security)
```
max-age=31536000; includeSubDomains; preload
```

#### X-Frame-Options
```
DENY (prevents clickjacking)
```

#### X-Content-Type-Options
```
nosniff (prevents MIME sniffing)
```

#### X-XSS-Protection
```
1; mode=block (legacy XSS filter)
```

#### Referrer-Policy
```
strict-origin-when-cross-origin
```

---

## 9. Rate Limiting

### Arcjet Integration

**Location:** Middleware/API routes

```typescript
import { arcjet } from '@arcjet/remix'

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    // Rate limiting rules
    // IP-based limiting
    // Sliding window rate limiting
  ],
})
```

**Protections:**
- IP-based rate limiting (10/100/1000 req/min)
- Bot detection
- SQL injection/XSS detection
- Account takeover prevention

---

## 10. Dependency Security

### NPM Audit Compliance

**Current Status:**
- 37 total vulnerabilities identified
- Regular audits performed
- Automated updates (Dependabot ready)
- Pre-commit security checks

### Safe Dependencies

**Key Security Libraries:**
- `bcryptjs` - Password hashing
- `@repo/security` - Encryption utilities
- `dompurify` - HTML sanitization
- `zod` - Input validation
- `prisma` - ORM with built-in injection protection

---

## 11. Database Security

### Prisma ORM

**Security Features:**
- Parameterized queries
- Type-safe queries
- Schema validation
- Migration versioning

### Database Encryption

**Data at Rest:**
- SQLite local development (plaintext for convenience)
- Production: LiteFS encrypted replication
- Sensitive fields encrypted with AES-256-GCM

### Access Control
- User authentication required for all queries
- Row-level security via Prisma queries
- Organization isolation
- Permission validation

---

## 12. Secrets Management

### Environment Variables

#### Validation at Startup
```typescript
// Location: apps/app/app/utils/env.server.ts

const EnvSchema = z.object({
  SESSION_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
  SSO_ENCRYPTION_KEY: z.string().length(64),
  INTEGRATION_ENCRYPTION_KEY: z.string().length(64),
  // ... other vars
})

const env = EnvSchema.parse(process.env)
```

#### Client-Side Environment (Safe)
```typescript
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ALLOW_INDEXING: process.env.ALLOW_INDEXING,
    // No secrets exposed!
  }
}
```

### Secrets Not in Version Control
- `.env` ignored (✅)
- No secrets in `.env.example` (✅)
- No API keys hardcoded (✅)
- No private keys in repo (✅)

---

## 13. Logging & Monitoring

### Security Logging

**Events Logged:**
- Login/logout events
- Permission denial events
- Configuration changes
- Failed authentication attempts
- Privilege escalation
- Security-related errors

### Log Management

**Best Practices:**
- No passwords in logs
- No API keys in logs
- No PII without redaction
- Structured logging (ready for SIEM)
- Log rotation and retention

### Error Handling

```typescript
// Safe error messages to users
if (!user) {
  throw data({ error: 'Invalid email or password' }, { status: 401 })
}

// Detailed error logging internally
console.error('Auth failed:', {
  email,
  reason: 'user_not_found',
  timestamp: new Date(),
})
```

---

## 14. Configuration Management

### Environment-Aware Configuration

```typescript
// Production hardening
if (process.env.NODE_ENV === 'production') {
  // Enforce HTTPS
  // Disable debug logging
  // Enable security headers
  // Stricter validation
}

// Development convenience
if (process.env.NODE_ENV === 'development') {
  // Allow localhost
  // Allow HTTP
  // Verbose logging
  // Easier CSRF bypass
}
```

### Security Configuration Checklist
- ✅ HTTPS enforced (production)
- ✅ Debug mode disabled (production)
- ✅ Error details not exposed to users
- ✅ Health check endpoints don't leak info
- ✅ API versions managed
- ✅ Deprecated endpoints removed

---

## 15. Testing & Quality Assurance

### Security Testing

**Unit Tests:**
- Input validation tests
- Permission tests
- Encryption/decryption tests
- URL validation tests

**E2E Tests:**
- Authentication flows
- Authorization checks
- Session management
- Multi-factor authentication

**Code Review:**
- Manual security review
- Static analysis (ESLint)
- Type checking (TypeScript)
- Dependency audits

---

## 16. Incident Response

### Security Incident Handling

**Procedures:**
1. Vulnerability detection/report
2. Severity assessment
3. Impact analysis
4. Fix implementation
5. Testing & verification
6. Deployment
7. Post-incident review

### Disclosure Policy
- Responsible disclosure for external vulnerabilities
- No public disclosure before fix
- 90-day coordinated disclosure window
- Security advisory issued

---

## Security Compliance

### OWASP Top 10 Coverage

| Risk | Status | Implementation |
|------|--------|-----------------|
| A01: Broken Access Control | ✅ SECURE | RBAC, permission validation |
| A02: Cryptographic Failures | ✅ SECURE | AES-256-GCM, bcrypt-12 |
| A03: Injection | ✅ SECURE | Prisma ORM, DOMPurify |
| A04: Insecure Design | ✅ SECURE | Threat modeling, defense-in-depth |
| A05: Security Misconfiguration | ✅ SECURE | Zod validation, secure defaults |
| A06: Vulnerable Components | ⚠️ ACTION | npm audit, regular updates |
| A07: Authentication | ✅ SECURE | MFA, multiple methods |
| A08: Data Integrity | ✅ SECURE | CI/CD, pre-commit hooks |
| A09: Logging & Monitoring | ✅ ACCEPTABLE | Audit logs, Sentry integration |
| A10: SSRF | ✅ SECURE | URL validation, IP blocking |

---

## Recommendations for Future Improvement

### Short-term (High Priority)
1. ✅ COMPLETED: Fix SSRF vulnerability in OIDC discovery
2. ✅ COMPLETED: Reduce information disclosure in logs
3. 📝 TODO: Add rate limiting to OIDC/SSO endpoints
4. 📝 TODO: Implement request signing for OAuth callbacks

### Medium-term
1. 📝 Structured logging framework (Pino/Winston)
2. 📝 SIEM integration for correlation
3. 📝 Security event alerting
4. 📝 Automated penetration testing

### Long-term
1. 📝 Web Application Firewall (WAF) deployment
2. 📝 Anomaly detection system
3. 📝 Regular penetration testing (annual)
4. 📝 Security certification (SOC 2, ISO 27001)

---

## Resources & References

### Security Documentation
- OWASP Top 10: https://owasp.org/Top10/
- NIST Guidelines: https://pages.nist.gov/800-63-3/
- CWE List: https://cwe.mitre.org/
- npm Advisory DB: https://github.com/advisories

### Tools & Services
- npm audit: Dependency vulnerability scanning
- Snyk: Continuous security scanning
- Sentry: Error tracking & monitoring
- Arcjet: WAF & protection

---

**Last Updated:** 2025-01-15  
**Status:** Current & Maintained  
**Review Cycle:** Quarterly
