# SSO Troubleshooting Guide

This guide helps diagnose and resolve common SSO authentication issues.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Error Messages](#common-error-messages)
- [Configuration Issues](#configuration-issues)
- [Authentication Flow Problems](#authentication-flow-problems)
- [User Provisioning Issues](#user-provisioning-issues)
- [Performance Issues](#performance-issues)
- [Security Concerns](#security-concerns)
- [Monitoring and Logging](#monitoring-and-logging)
- [Advanced Troubleshooting](#advanced-troubleshooting)

## Quick Diagnostics

### Health Check

First, check the overall SSO system health:

```bash
# Check system health
curl -H "Authorization: Bearer <admin-token>" \
  https://your-domain.com/api/health/sso

# Check specific configuration
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -d "configurationId=<config-id>" \
  https://your-domain.com/api/sso/health
```

### Configuration Test

Use the built-in connection test in the admin panel:

1. Go to Admin > Organizations > [Your Org] > SSO
2. Click "Test Connection"
3. Review the test results and error messages

## Common Error Messages

### "OIDC Discovery Failed"

**Error**: `OIDC discovery failed: HTTP 404: Not Found`

**Cause**: The identity provider doesn't support OIDC discovery or the issuer
URL is incorrect.

**Solutions**:

1. Verify the issuer URL format:
   - Okta: `https://your-domain.okta.com`
   - Azure AD: `https://login.microsoftonline.com/{tenant-id}/v2.0`
   - Auth0: `https://your-domain.auth0.com`

2. Test the discovery endpoint manually:

   ```bash
   curl https://your-issuer-url/.well-known/openid-configuration
   ```

3. If discovery fails, use manual endpoint configuration:
   - Disable "Auto Discovery"
   - Manually enter authorization and token URLs

### "Invalid Client Credentials"

**Error**: `Authentication failed: invalid_client`

**Cause**: Incorrect client ID or secret, or client not properly configured.

**Solutions**:

1. Verify client credentials in identity provider
2. Check if client secret has expired
3. Ensure client is configured for "Authorization Code" flow
4. Verify redirect URIs match exactly (including trailing slashes)

### "User Not Found or Not Authorized"

**Error**: `User does not exist and auto-provisioning is disabled`

**Cause**: User doesn't exist in the system and auto-provisioning is disabled.

**Solutions**:

1. Enable auto-provisioning in SSO configuration
2. Manually create the user account
3. Check user assignment in identity provider
4. Verify organization membership rules

### "Token Exchange Failed"

**Error**: `Token exchange failed: invalid_grant`

**Cause**: Issues with the OAuth2 authorization code exchange.

**Solutions**:

1. Check system clock synchronization
2. Verify PKCE configuration matches identity provider
3. Ensure authorization code hasn't expired
4. Check for network connectivity issues

### "Attribute Mapping Error"

**Error**: `Required attribute 'email' not found in user info`

**Cause**: Identity provider doesn't return expected user attributes.

**Solutions**:

1. Check requested scopes include necessary claims
2. Review attribute mapping configuration
3. Test with identity provider's user info endpoint
4. Update mapping to use available attributes

## Configuration Issues

### Issuer URL Problems

**Symptoms**:

- Discovery fails
- Endpoints not found
- SSL/TLS errors

**Diagnosis**:

```bash
# Test issuer URL accessibility
curl -I https://your-issuer-url

# Test discovery endpoint
curl https://your-issuer-url/.well-known/openid-configuration

# Check SSL certificate
openssl s_client -connect your-issuer-domain:443 -servername your-issuer-domain
```

**Solutions**:

1. Ensure URL is accessible from your server
2. Check for firewall or proxy issues
3. Verify SSL certificate is valid
4. Use correct protocol (https vs http)

### Redirect URI Mismatches

**Symptoms**:

- "redirect_uri_mismatch" errors
- Authentication starts but fails to complete

**Diagnosis**: Check configured redirect URIs in identity provider match
exactly:

- Expected: `https://your-domain.com/auth/sso/your-org-slug/callback`
- Common mistakes:
  - Missing trailing slash
  - Wrong protocol (http vs https)
  - Incorrect organization slug
  - Extra path components

**Solutions**:

1. Update redirect URIs in identity provider
2. Verify organization slug is correct
3. Ensure protocol matches (https in production)
4. Check for URL encoding issues

### Scope Configuration

**Symptoms**:

- Missing user attributes
- Insufficient permissions errors
- Token validation failures

**Diagnosis**: Review requested scopes and returned claims:

```bash
# Check what scopes are supported
curl https://your-issuer-url/.well-known/openid-configuration | jq .scopes_supported

# Test with minimal scopes
# Start with: "openid email profile"
```

**Solutions**:

1. Request minimum required scopes
2. Add scopes gradually to identify issues
3. Check identity provider documentation for available scopes
4. Verify user has permissions for requested scopes

## Authentication Flow Problems

### Infinite Redirect Loops

**Symptoms**:

- Browser keeps redirecting between application and identity provider
- "Too many redirects" error

**Diagnosis**:

1. Check browser network tab for redirect chain
2. Verify session handling
3. Check for conflicting authentication methods

**Solutions**:

1. Clear browser cookies and cache
2. Check session configuration
3. Verify logout URLs are configured correctly
4. Ensure no conflicting authentication middleware

### Session Management Issues

**Symptoms**:

- Users logged out unexpectedly
- Session timeouts too short/long
- Multiple login prompts

**Diagnosis**:

1. Check session duration settings
2. Review token expiration times
3. Verify refresh token handling

**Solutions**:

1. Configure appropriate session timeouts
2. Implement proper token refresh logic
3. Handle token expiration gracefully
4. Check identity provider session settings

### PKCE Configuration

**Symptoms**:

- "code_challenge_required" errors
- "invalid_code_verifier" errors

**Diagnosis**: Check PKCE requirements:

```bash
# Check if PKCE is required
curl https://your-issuer-url/.well-known/openid-configuration | jq .code_challenge_methods_supported
```

**Solutions**:

1. Enable PKCE in SSO configuration (recommended)
2. Ensure identity provider supports PKCE
3. Use S256 code challenge method
4. Verify code verifier generation

## User Provisioning Issues

### User Creation Failures

**Symptoms**:

- Authentication succeeds but user not created
- "User provisioning failed" errors

**Diagnosis**:

1. Check auto-provisioning settings
2. Review user attribute requirements
3. Verify database permissions

**Solutions**:

1. Enable auto-provisioning
2. Ensure required attributes are available
3. Check database connectivity
4. Review user creation permissions

### Attribute Mapping Problems

**Symptoms**:

- Missing user information
- Incorrect user attributes
- Mapping errors in logs

**Diagnosis**: Test attribute mapping:

```bash
# Get user info from identity provider
curl -H "Authorization: Bearer <access-token>" \
  https://your-issuer-url/userinfo
```

**Solutions**:

1. Update attribute mapping configuration
2. Use correct attribute paths for nested objects
3. Handle missing attributes gracefully
4. Test with different user accounts

### Role Assignment Issues

**Symptoms**:

- Users have incorrect roles
- Permission denied errors
- Missing organization membership

**Diagnosis**:

1. Check default role configuration
2. Review organization role mappings
3. Verify group-based role assignment

**Solutions**:

1. Configure appropriate default roles
2. Implement group-based role mapping
3. Handle role updates on subsequent logins
4. Provide manual role override capability

## Performance Issues

### Slow Authentication

**Symptoms**:

- Long delays during SSO login
- Timeouts during authentication

**Diagnosis**:

1. Check network latency to identity provider
2. Review connection pool settings
3. Monitor cache hit rates

**Solutions**:

1. Optimize network connectivity
2. Increase connection pool size
3. Enable caching for configurations
4. Implement retry logic with backoff

### High Memory Usage

**Symptoms**:

- Application memory usage increases over time
- Out of memory errors

**Diagnosis**:

1. Monitor cache sizes
2. Check for memory leaks in SSO components
3. Review session storage

**Solutions**:

1. Configure cache size limits
2. Implement cache eviction policies
3. Monitor and tune garbage collection
4. Use external session storage if needed

### Database Performance

**Symptoms**:

- Slow SSO-related database queries
- Database connection pool exhaustion

**Diagnosis**:

1. Check database query performance
2. Review index usage
3. Monitor connection pool metrics

**Solutions**:

1. Add database indexes for SSO tables
2. Optimize frequently used queries
3. Increase connection pool size
4. Consider read replicas for heavy loads

## Security Concerns

### Token Security

**Symptoms**:

- Token validation failures
- Security warnings in logs

**Diagnosis**:

1. Check token encryption
2. Review token storage security
3. Verify token expiration handling

**Solutions**:

1. Ensure tokens are encrypted at rest
2. Use secure token storage
3. Implement proper token rotation
4. Monitor for token abuse

### Audit Trail Issues

**Symptoms**:

- Missing audit logs
- Incomplete security events

**Diagnosis**:

1. Check audit logging configuration
2. Review log retention policies
3. Verify log integrity

**Solutions**:

1. Enable comprehensive audit logging
2. Configure appropriate log retention
3. Implement log monitoring and alerting
4. Ensure logs are tamper-proof

## Monitoring and Logging

### Log Analysis

Key log locations:

- Application logs: `/var/log/app/`
- SSO audit logs: Database audit_log table
- Identity provider logs: Provider-specific location

Important log patterns to monitor:

```bash
# Authentication failures
grep "SSO authentication failed" /var/log/app/app.log

# Configuration errors
grep "SSO configuration" /var/log/app/app.log | grep ERROR

# Performance issues
grep "SSO.*timeout\|SSO.*slow" /var/log/app/app.log
```

### Metrics to Monitor

1. **Authentication Success Rate**: Percentage of successful SSO logins
2. **Response Times**: Average time for SSO authentication
3. **Error Rates**: Frequency of different error types
4. **Cache Hit Rates**: Effectiveness of configuration caching
5. **Token Refresh Rates**: Frequency of token refresh operations

### Alerting

Set up alerts for:

- Authentication failure rate > 10%
- Average response time > 5 seconds
- Configuration validation failures
- Identity provider connectivity issues
- Unusual authentication patterns

## Advanced Troubleshooting

### Network Debugging

Use network tools to diagnose connectivity:

```bash
# Test DNS resolution
nslookup your-identity-provider.com

# Test connectivity
telnet your-identity-provider.com 443

# Trace network path
traceroute your-identity-provider.com

# Test SSL handshake
openssl s_client -connect your-identity-provider.com:443
```

### Protocol Analysis

Capture and analyze OAuth2/OIDC flows:

```bash
# Use curl to simulate authentication flow
curl -v -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=<auth-code>&client_id=<client-id>&client_secret=<client-secret>&redirect_uri=<redirect-uri>" \
  https://your-identity-provider.com/oauth2/token
```

### Database Debugging

Check SSO-related database state:

```sql
-- Check SSO configurations
SELECT id, organizationId, providerName, isEnabled, lastTested
FROM SSOConfiguration;

-- Check active SSO sessions
SELECT s.id, s.providerUserId, s.tokenExpiresAt, u.email
FROM SSOSession s
JOIN Session sess ON s.sessionId = sess.id
JOIN User u ON sess.userId = u.id
WHERE s.tokenExpiresAt > datetime('now');

-- Check recent audit logs
SELECT action, details, createdAt
FROM AuditLog
WHERE action LIKE '%sso%'
ORDER BY createdAt DESC
LIMIT 10;
```

### Cache Debugging

Monitor cache performance:

```bash
# Check cache statistics via health endpoint
curl -H "Authorization: Bearer <admin-token>" \
  https://your-domain.com/api/health/sso | jq .checks.cache
```

### Identity Provider Testing

Test identity provider endpoints directly:

```bash
# Test discovery endpoint
curl https://your-issuer-url/.well-known/openid-configuration

# Test authorization endpoint (should return 400 for missing params)
curl https://your-issuer-url/oauth2/authorize

# Test token endpoint (should return 400 for missing params)
curl -X POST https://your-issuer-url/oauth2/token
```

### Support Information Collection

When escalating issues, collect:

1. **System Information**:
   - Application version
   - Environment (production/staging)
   - Server specifications

2. **Configuration Details**:
   - Identity provider type
   - Issuer URL (sanitized)
   - Enabled features

3. **Error Information**:
   - Complete error messages
   - Stack traces
   - Relevant log entries

4. **Reproduction Steps**:
   - Detailed steps to reproduce
   - Expected vs actual behavior
   - Affected user accounts

5. **Timeline**:
   - When issue started
   - Recent changes
   - Frequency of occurrence

This information helps support teams diagnose and resolve issues more
efficiently.
