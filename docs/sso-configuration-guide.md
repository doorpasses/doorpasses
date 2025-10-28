# SSO Configuration Guide

This guide provides step-by-step instructions for configuring Single Sign-On
(SSO) authentication with various identity providers.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Supported Identity Providers](#supported-identity-providers)
- [Configuration Steps](#configuration-steps)
- [Identity Provider Setup](#identity-provider-setup)
- [Testing Your Configuration](#testing-your-configuration)
- [User Provisioning](#user-provisioning)
- [Troubleshooting](#troubleshooting)

## Overview

The SSO system supports OAuth2/OpenID Connect (OIDC) compliant identity
providers, allowing organizations to authenticate users through their existing
corporate identity systems.

### Key Features

- **Auto-discovery**: Automatic endpoint discovery via OIDC well-known
  configuration
- **Manual configuration**: Support for custom endpoint configuration
- **User provisioning**: Just-in-time user creation and attribute mapping
- **Security**: PKCE support, token encryption, and comprehensive audit logging
- **Multi-tenancy**: Organization-specific SSO configurations

## Prerequisites

Before configuring SSO, ensure you have:

1. **Admin Access**: System administrator privileges in the application
2. **Identity Provider Access**: Administrative access to your identity provider
3. **Organization Setup**: A configured organization in the system
4. **Domain Verification**: (Optional) Verified domain for your organization

## Supported Identity Providers

The system supports any OAuth2/OIDC compliant identity provider, including:

- **Okta**
- **Azure Active Directory (Azure AD)**
- **Auth0**
- **Google Workspace**
- **Keycloak**
- **Ping Identity**
- **OneLogin**
- **Custom OIDC providers**

## Configuration Steps

### Step 1: Access SSO Configuration

1. Navigate to the Admin panel
2. Select your organization
3. Go to the "SSO Configuration" section
4. Click "Configure SSO"

### Step 2: Basic Configuration

Fill in the required fields:

#### Provider Information

- **Provider Name**: Choose from the dropdown or enter "custom"
- **Issuer URL**: The base URL of your identity provider
  - Example: `https://your-domain.okta.com`
  - Example: `https://login.microsoftonline.com/{tenant-id}/v2.0`

#### OAuth2 Credentials

- **Client ID**: The OAuth2 client ID from your identity provider
- **Client Secret**: The OAuth2 client secret (will be encrypted)

#### Scopes

- **Default**: `openid email profile`
- **Custom**: Add additional scopes as needed (space-separated)

### Step 3: Advanced Configuration

#### Auto-Discovery Settings

- **Enable Auto-Discovery**: Recommended for OIDC-compliant providers
- **Manual Endpoints**: Use if auto-discovery is not available

#### Security Settings

- **Enable PKCE**: Recommended for enhanced security (enabled by default)
- **Scopes**: Customize the OAuth2 scopes requested

#### User Provisioning

- **Auto-Provision Users**: Create users automatically on first login
- **Default Role**: Default organization role for new users
- **Attribute Mapping**: Map identity provider attributes to user fields

### Step 4: Test Configuration

1. Click "Test Connection" to verify the configuration
2. Review any warnings or errors
3. Fix any issues before enabling

### Step 5: Enable SSO

1. Toggle "Enable SSO" to activate the configuration
2. Users can now authenticate via SSO

## Identity Provider Setup

### Okta Configuration

1. **Create Application**:
   - Sign in to Okta Admin Console
   - Go to Applications > Applications
   - Click "Create App Integration"
   - Choose "OIDC - OpenID Connect"
   - Select "Web Application"

2. **Configure Application**:
   - **App integration name**: Your application name
   - **Grant types**: Authorization Code
   - **Sign-in redirect URIs**:
     `https://your-domain.com/auth/sso/{org-slug}/callback`
   - **Sign-out redirect URIs**:
     `https://your-domain.com/auth/sso/{org-slug}/logout`

3. **Get Credentials**:
   - Note the **Client ID** and **Client Secret**
   - The **Issuer URL** is: `https://your-domain.okta.com`

4. **Assign Users**:
   - Go to Assignments tab
   - Assign users or groups who should have access

### Azure AD Configuration

1. **Register Application**:
   - Go to Azure Portal > Azure Active Directory
   - Select "App registrations" > "New registration"
   - **Name**: Your application name
   - **Redirect URI**: `https://your-domain.com/auth/sso/{org-slug}/callback`

2. **Configure Authentication**:
   - Go to Authentication
   - Add redirect URI if not added during registration
   - Enable "ID tokens" under Implicit grant and hybrid flows

3. **Create Client Secret**:
   - Go to Certificates & secrets
   - Click "New client secret"
   - Copy the secret value (not the ID)

4. **Get Configuration**:
   - **Client ID**: Application (client) ID from Overview
   - **Client Secret**: The secret value created above
   - **Issuer URL**: `https://login.microsoftonline.com/{tenant-id}/v2.0`

### Auth0 Configuration

1. **Create Application**:
   - Go to Auth0 Dashboard > Applications
   - Click "Create Application"
   - Choose "Regular Web Applications"

2. **Configure Application**:
   - Go to Settings tab
   - **Allowed Callback URLs**:
     `https://your-domain.com/auth/sso/{org-slug}/callback`
   - **Allowed Logout URLs**:
     `https://your-domain.com/auth/sso/{org-slug}/logout`

3. **Get Credentials**:
   - **Client ID** and **Client Secret** from Settings
   - **Issuer URL**: `https://your-domain.auth0.com`

### Google Workspace Configuration

1. **Create OAuth2 Client**:
   - Go to Google Cloud Console
   - Select your project or create a new one
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"

2. **Configure OAuth Client**:
   - **Application type**: Web application
   - **Authorized redirect URIs**:
     `https://your-domain.com/auth/sso/{org-slug}/callback`

3. **Get Configuration**:
   - **Client ID** and **Client Secret** from the created credentials
   - **Issuer URL**: `https://accounts.google.com`

## Testing Your Configuration

### Connection Test

The system provides a built-in connection test that verifies:

1. **OIDC Discovery**: Can retrieve the well-known configuration
2. **Endpoint Connectivity**: Can reach authorization and token endpoints
3. **Configuration Validity**: All required fields are properly configured

### Manual Testing

1. **Test SSO Login**:
   - Navigate to your organization's login page
   - Click the SSO login button
   - Verify redirect to identity provider
   - Complete authentication
   - Verify successful login and user creation

2. **Test User Provisioning**:
   - Use a test user account
   - Verify user attributes are mapped correctly
   - Check organization membership and roles

## User Provisioning

### Automatic Provisioning

When enabled, the system will:

1. **Create Users**: Automatically create user accounts on first login
2. **Update Attributes**: Update user information from identity provider
3. **Assign Roles**: Assign the configured default organization role
4. **Map Attributes**: Apply custom attribute mappings

### Attribute Mapping

Configure how identity provider attributes map to user fields:

```json
{
	"email": "email",
	"name": "name",
	"username": "preferred_username",
	"firstName": "given_name",
	"lastName": "family_name",
	"department": "department"
}
```

### Custom Mappings

For nested attributes or custom claims:

```json
{
	"email": "email",
	"name": "profile.displayName",
	"department": "custom_claims.department",
	"groups": "groups"
}
```

## Troubleshooting

### Common Issues

#### 1. "OIDC Discovery Failed"

**Symptoms**: Connection test fails with discovery error

**Solutions**:

- Verify the issuer URL is correct
- Check if the identity provider supports OIDC discovery
- Try manual endpoint configuration
- Ensure the well-known endpoint is accessible

#### 2. "Invalid Client Credentials"

**Symptoms**: Authentication fails with client credential error

**Solutions**:

- Verify client ID and secret are correct
- Check if client secret has expired
- Ensure the application is properly configured in the identity provider
- Verify redirect URIs match exactly

#### 3. "User Not Authorized"

**Symptoms**: User can authenticate but access is denied

**Solutions**:

- Check user/group assignments in identity provider
- Verify organization membership rules
- Review user provisioning settings
- Check attribute mapping configuration

#### 4. "Token Exchange Failed"

**Symptoms**: Authentication starts but fails during token exchange

**Solutions**:

- Verify token endpoint configuration
- Check client authentication method
- Ensure PKCE settings match identity provider requirements
- Review network connectivity and firewall rules

### Health Check Endpoints

Monitor SSO system health using these endpoints:

- **System Health**: `GET /api/health/sso`
- **Configuration Validation**: `POST /api/sso/health`

### Logs and Monitoring

Check the following for troubleshooting:

1. **Application Logs**: Server logs for detailed error messages
2. **Audit Logs**: SSO-specific audit trail in the admin panel
3. **Identity Provider Logs**: Check your identity provider's logs
4. **Network Logs**: Verify network connectivity and DNS resolution

### Debug Mode

Enable debug logging by setting environment variables:

```bash
# Enable SSO debug logging
SSO_DEBUG=true

# Enable detailed OAuth2 logging
OAUTH2_DEBUG=true
```

### Support Information

When contacting support, provide:

1. **Configuration Details**: Provider type, issuer URL (without secrets)
2. **Error Messages**: Complete error messages from logs
3. **Test Results**: Results from connection tests
4. **User Information**: Affected user details (without sensitive data)
5. **Timeline**: When the issue started occurring

### Security Considerations

1. **Client Secrets**: Always use secure, randomly generated secrets
2. **Redirect URIs**: Use exact matches, avoid wildcards
3. **Scopes**: Request only necessary scopes
4. **Token Storage**: Tokens are encrypted at rest
5. **Audit Logging**: All SSO activities are logged for security monitoring

### Performance Optimization

1. **Caching**: Configurations and strategies are cached for performance
2. **Connection Pooling**: HTTP connections are pooled for efficiency
3. **Retry Logic**: Automatic retry for transient failures
4. **Health Monitoring**: Continuous monitoring of system health

For additional support or advanced configuration options, consult the system
administrator or refer to the technical documentation.
