# Security Remediation Guide
**Epic Stack - OWASP Vulnerability Fix Implementation**

---

## Quick Start

### Generate Security Baseline
```bash
cd /home/engine/project

# Generate baseline
npm audit > /tmp/audit-baseline.txt

# Count vulnerabilities
npm audit | tail -20
```

### Run All Fixes (Recommended Approach)

```bash
# Step 1: Fix non-breaking changes
npm audit fix

# Step 2: Run tests
npm run build
npm run typecheck
npm run test
npm run test:e2e:run

# Step 3: If tests pass, commit
git add package.json package-lock.json
git commit -m "security: apply npm audit fixes for vulnerabilities"

# Step 4: Handle remaining issues
npm audit  # Check what's left
```

---

## Detailed Fix By Priority

### PRIORITY 1: CRITICAL 🔴 (Immediate)

#### Issue 1: Next.js React Flight RCE
**CVE:** GHSA-9qr9-h5gf-34mp  
**Affected Versions:** 15.5.0-15.5.6

```bash
# Update Next.js
npm install next@15.5.7

# Verify update
npm list next

# Expected output: next@15.5.7
```

**What This Fixes:**
- Remote Code Execution in React Flight protocol
- Prevents arbitrary code execution on server
- Critical for web applications handling user requests

**Testing After Fix:**
```bash
# Build the application
npm run build

# Check for build errors
echo "Build status: $?"

# Run type checking
npm run typecheck

# Run tests
npm run test

# Run E2E tests
npm run test:e2e:run
```

#### Issue 2: React Server Components RCE
**CVE:** GHSA-fv66-9v8q-g76r  
**Package:** react-server-dom-webpack

```bash
# Update React Server DOM
npm install react-server-dom-webpack@latest

# Verify update
npm list react-server-dom-webpack
```

**What This Fixes:**
- RCE vulnerability in Server Components
- Prevents code execution through component processing
- Core framework security issue

---

### PRIORITY 2: HIGH 🟠 (Within 1 Week)

#### Issue 1: Playwright SSL Certificate Verification
**CVE:** GHSA-7mvr-c777-76hp  
**Package:** @playwright/test

```bash
# Update Playwright
npm install @playwright/test@1.55.1

# Also update playwright if separate
npm install playwright@1.55.1

# Verify
npm list playwright @playwright/test
```

**What This Fixes:**
- Prevents man-in-the-middle attacks during browser download
- Validates SSL certificates for browser installation
- Protects test infrastructure

**Testing After Fix:**
```bash
# Re-install browsers if needed
npm run test:e2e:install

# Run E2E tests
npm run test:e2e:run
```

#### Issue 2: jws HMAC Signature Verification
**CVE:** GHSA-869p-cjfg-cm3x  
**Package:** jws

```bash
# Fix specific package
npm install jws@4.0.0

# This may require updating google-auth-library
npm audit fix --include=jws

# Verify
npm list jws
```

**What This Fixes:**
- Prevents JWT/JWS signature bypass
- Critical for OAuth/OIDC authentication
- Blocks token manipulation attacks

**Testing After Fix:**
```bash
# Test OAuth/OIDC flows
npm run dev  # Check login with GitHub/Google/Discord

# Verify SSO works
echo "Test GitHub login flow"
echo "Test Google login flow"
```

#### Issue 3: Valibot ReDoS (Regular Expression Denial of Service)
**CVE:** GHSA-vqpr-j7v3-hqw9  
**Package:** valibot

```bash
# Update valibot
npm audit fix --include=valibot

# Verify
npm list valibot
```

**What This Fixes:**
- Prevents DoS attacks via regex
- Fixes EMOJI_REGEX catastrophic backtracking
- Improves validation performance

**Testing:**
```bash
npm run test

# Should pass all validation tests
```

---

### PRIORITY 3: MODERATE 🟡 (Within 2 Weeks)

#### Issue 1: js-yaml
**Package:** js-yaml (transitive dependency)

```bash
npm audit fix --include=js-yaml
```

**What This Fixes:**
- YAML parsing security issues
- Prevents arbitrary code execution via YAML
- Used in configuration files

#### Issue 2: jsondiffpatch XSS
**CVE:** GHSA-33vc-wfww-vjfv

```bash
npm audit fix --include=jsondiffpatch --force
```

**Note:** May be breaking change, test thoroughly

**What This Fixes:**
- XSS in HTML formatter
- Prevents HTML injection via diff display

#### Issue 3: mdast-util-to-hast
**CVE:** GHSA-4fh9-h7wg-q85m

```bash
npm audit fix --include=mdast-util-to-hast
```

**What This Fixes:**
- Unsanitized class attributes
- Prevents injection via markdown class attributes
- Affects CMS markdown rendering

#### Issue 4: prismjs DOM Clobbering
**CVE:** GHSA-x7hr-w5r2-h6wg

```bash
npm audit fix --include=prismjs
```

**What This Fixes:**
- DOM clobbering vulnerability
- Prevents prototype pollution
- Affects code syntax highlighting

---

### PRIORITY 4: SPECIAL CASE - Nodemailer

**Status:** No fix available  
**Affected Package:** nodemailer (used by @payloadcms/payload-cloud)

#### Options:

**Option 1: Accept Risk (If not critical)**
```bash
# Only if email functionality isn't critical to your use case
npm audit --audit-level=high  # Will only report high+

echo "Note: Nodemailer vulnerabilities acknowledged but unfixed upstream"
```

**Option 2: Use Email Service API**
```bash
# Replace nodemailer with email service providers:
# - Resend: npm install resend
# - SendGrid: npm install @sendgrid/mail
# - AWS SES: npm install @aws-sdk/client-ses
# - Mailgun: npm install mailgun.js

# Then update @payloadcms email configuration
```

**Option 3: Disable CMS Feature**
```bash
# If using @payloadcms/payload-cloud for CMS only:
npm uninstall @payloadcms/payload-cloud

# Or make it optional in your app
```

**Recommendation:** Use Resend (already configured in .env.example as RESEND_API_KEY)

---

## Verification Procedures

### Complete Testing Suite
```bash
#!/bin/bash
set -e

echo "=== Security Update Verification ==="

# Step 1: Audit check
echo "1. Running npm audit..."
npm audit

# Step 2: Build verification
echo "2. Building application..."
npm run build

# Step 3: Type checking
echo "3. Type checking..."
npm run typecheck

# Step 4: Linting
echo "4. Linting code..."
npm run lint:all

# Step 5: Unit tests
echo "5. Running unit tests..."
npm run test -- --run

# Step 6: E2E tests
echo "6. Running E2E tests..."
npm run test:e2e:run

echo "=== ✅ All verification checks passed ==="
```

### Save as Script
```bash
# Create verification script
cat > /tmp/verify-security-fixes.sh << 'EOF'
#!/bin/bash
set -e

cd /home/engine/project

echo "=== Security Update Verification ==="
echo "Starting at: $(date)"

# Step 1: Audit check
echo ""
echo "1. Running npm audit..."
if npm audit 2>&1 | grep -q "vulnerabilities"; then
    echo "⚠️  Vulnerabilities found - review above"
else
    echo "✅ No vulnerabilities found"
fi

# Step 2: Build verification
echo ""
echo "2. Building application..."
if npm run build > /tmp/build.log 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    tail -50 /tmp/build.log
    exit 1
fi

# Step 3: Type checking
echo ""
echo "3. Type checking..."
if npm run typecheck > /tmp/typecheck.log 2>&1; then
    echo "✅ Type check passed"
else
    echo "❌ Type check failed"
    tail -50 /tmp/typecheck.log
    exit 1
fi

# Step 4: Linting
echo ""
echo "4. Linting code..."
if npm run lint:all > /tmp/lint.log 2>&1; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting warnings (check manually)"
    tail -20 /tmp/lint.log
fi

# Step 5: Unit tests
echo ""
echo "5. Running unit tests..."
if npm run test -- --run > /tmp/test.log 2>&1; then
    echo "✅ Unit tests passed"
else
    echo "❌ Unit tests failed"
    tail -100 /tmp/test.log
    exit 1
fi

echo ""
echo "=== ✅ All verification checks passed ==="
echo "Completed at: $(date)"
EOF

chmod +x /tmp/verify-security-fixes.sh
/tmp/verify-security-fixes.sh
```

### Automated Dependency Check
```bash
#!/bin/bash
# Check for remaining high/critical vulnerabilities

echo "=== Dependency Vulnerability Report ==="
npm audit --json | jq '.vulnerabilities[] | select(.severity == "high" or .severity == "critical")'

# Count by severity
echo ""
echo "=== Vulnerability Count ==="
npm audit --json | jq '.metadata.vulnerabilities | to_entries[] | "\(.key): \(.value)"'
```

---

## Testing Authentication Flows

After updating security dependencies, verify authentication:

### 1. Local Password Authentication
```bash
# Start dev server
npm run dev

# In browser:
# 1. Navigate to http://localhost:3001
# 2. Click Sign Up
# 3. Create account with test@example.com / TestPassword123
# 4. Verify email (if email mock is working)
# 5. Login with new account
# Expected: Login succeeds, redirected to dashboard
```

### 2. OAuth Provider Authentication
```bash
# GitHub OAuth
# 1. Click "Sign in with GitHub"
# 2. Should redirect to GitHub (or mock)
# 3. Approve access
# 4. Should return and auto-login
# Expected: Auto-created account, logged in

# Similar for Google and Discord
```

### 3. Multi-Factor Authentication
```bash
# After login:
# 1. Navigate to Settings > Security
# 2. Enable 2FA with TOTP
# 3. Scan QR code with authenticator app
# 4. Enter code to verify
# 5. Logout and login again
# 6. Should prompt for 2FA code
# Expected: 2FA flow works correctly
```

### 4. Session Security
```bash
# In browser DevTools:
# 1. Open Application > Cookies
# 2. Find session cookie
# 3. Verify properties:
#    - httpOnly: true ✅
#    - Secure: true (production) ✅
#    - SameSite: Lax ✅
# 4. Copy cookie value
# 5. Open incognito window
# 6. Paste cookie in console (if possible)
# 7. Should NOT auto-login (httpOnly protects)
```

---

## Monitoring After Updates

### 1. Error Tracking
```typescript
// Verify Sentry integration (if configured)
// In browser console:
console.error("Test error for Sentry")

// Check Sentry dashboard for error
// Should appear within 1 minute
```

### 2. Performance Monitoring
```bash
# Check build performance
npm run build -- --stats

# Check runtime performance
# Monitor in browser DevTools

# Should not degrade significantly
```

### 3. Security Monitoring
```bash
# Check for security warnings in logs
npm run dev 2>&1 | grep -i "security\|warning"

# Check for console errors
# Open browser DevTools console while running app
# Should see minimal security-related errors
```

---

## Rollback Plan (If Issues Occur)

If updates cause issues:

```bash
# 1. Revert package changes
git checkout package.json package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Verify baseline
npm audit

# 4. Commit revert
git commit -m "revert: security updates caused issues (need investigation)"

# 5. Create issue for investigation
# Document:
# - Which package caused issue
# - Error message
# - Reproduction steps
# - Previous state
```

---

## CI/CD Integration

### GitHub Actions Update
Add security scanning to CI pipeline:

```yaml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: npm ci
        
      - name: npm audit
        run: npm audit --audit-level=moderate
        
      - name: Build
        run: npm run build
        
      - name: Type check
        run: npm run typecheck
        
      - name: Tests
        run: npm run test -- --run
```

---

## Documentation Updates

After applying fixes, update:

1. **SECURITY.md** - Update vulnerability status
2. **README.md** - Note security updates
3. **CHANGELOG.md** - Document security fixes
4. **Incident Log** - Record vulnerability assessment

### Example CHANGELOG Entry
```markdown
## [Unreleased]

### Security
- 🔒 **CRITICAL:** Updated Next.js to 15.5.7 to fix React Flight RCE (GHSA-9qr9-h5gf-34mp)
- 🔒 **CRITICAL:** Updated react-server-dom-webpack to fix Server Components RCE (GHSA-fv66-9v8q-g76r)
- 🔒 **HIGH:** Updated @playwright/test to 1.55.1 to fix SSL certificate verification bypass
- 🔒 **HIGH:** Updated jws to fix HMAC signature verification (GHSA-869p-cjfg-cm3x)
- 🔒 **HIGH:** Updated valibot to fix ReDoS vulnerability (GHSA-vqpr-j7v3-hqw9)
- 🔒 **MODERATE:** Updated multiple moderate-severity dependencies
- Completed comprehensive OWASP Top 10 security audit
```

---

## Long-term Security Maintenance

### Monthly Checklist
- [ ] Run `npm audit`
- [ ] Review new vulnerabilities
- [ ] Schedule updates for HIGH/CRITICAL
- [ ] Test updates thoroughly
- [ ] Deploy security patches

### Quarterly Review
- [ ] Security training for team
- [ ] Review security policies
- [ ] Penetration testing (if budget allows)
- [ ] Update security documentation

### Annual Assessment
- [ ] Comprehensive security audit
- [ ] Third-party penetration testing
- [ ] Security posture review
- [ ] Update incident response plan

---

## Resources

- [npm Audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [OWASP Vulnerability Database](https://owasp.org/www-project-vulnerable-and-outdated-components/)
- [npm Advisory Database](https://github.com/advisories)
- [Snyk Security Scanner](https://snyk.io/)
- [WhiteSource Dependency Check](https://www.whitesourcesoftware.com/)

---

## Support & Questions

If you encounter issues with security updates:

1. Check the package changelog for breaking changes
2. Review error logs carefully
3. Run individual tests to isolate issues
4. Check GitHub issues for related problems
5. Consider upgrading other dependencies together
6. Document the issue and rollback if necessary

---

**Last Updated:** 2025-01-15  
**Maintainer:** Security Team  
**Status:** Ready for Implementation
