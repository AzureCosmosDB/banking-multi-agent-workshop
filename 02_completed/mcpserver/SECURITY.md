# Banking MCP Server - Security Documentation

## Overview

This document outlines the security enhancements implemented in the Banking MCP HTTP Server to ensure production-ready security for financial applications.

## Security Features Implemented

### 1. Authentication & Authorization

#### JWT Token Management
- **Access Tokens**: Short-lived (1 hour default) with proper expiration
- **Refresh Tokens**: Longer-lived (24 hours default) for token renewal
- **Token Revocation**: Support for blacklisting compromised tokens
- **Unique JWT IDs**: Each token has unique identifier for revocation

#### Role-Based Access Control (RBAC)
- **User Roles**: `admin`, `customer`, `agent`, `read_only`
- **Tool Permissions**: Each tool has specific role requirements
- **Permission Checking**: Automatic validation before tool execution

#### Password Security
- **PBKDF2 Hashing**: Industry-standard password hashing with salt
- **Strong Password Requirements**: Minimum 8 characters
- **Secure Comparison**: Constant-time password verification

### 2. Input Validation & Sanitization

#### Request Validation
- **Pydantic Models**: Automatic input validation and type checking
- **String Sanitization**: Removal of potentially dangerous characters
- **Length Limits**: Maximum string lengths to prevent buffer overflows
- **Format Validation**: Account numbers and amounts follow strict patterns

#### Banking-Specific Validation
- **Account Numbers**: Must match pattern `^[0-9]{10,20}$`
- **Amounts**: Must match pattern `^[0-9]+(\.[0-9]{1,2})?$`
- **Recursive Sanitization**: Deep cleaning of nested objects

### 3. Rate Limiting & DOS Protection

#### Request Limiting
- **Per-IP Limits**: 100 requests per minute by default
- **Sliding Window**: Time-based request tracking
- **Automatic Cleanup**: Old request records are purged
- **429 Status Codes**: Proper HTTP response for rate limiting

### 4. CORS Security

#### Origin Control
- **Specific Origins**: Only allowed domains can access API
- **No Wildcards**: Removes `allow_origins=["*"]` vulnerability
- **Method Restrictions**: Only GET and POST methods allowed
- **Header Control**: Only necessary headers permitted

### 5. Audit Logging

#### Security Events
- **Authentication Attempts**: Success and failure logging
- **Tool Calls**: All tool invocations are logged
- **Security Violations**: Rate limits, unauthorized access, invalid tokens
- **Token Operations**: Token creation, refresh, and revocation

#### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event_type": "authentication",
  "user_id": "user123",
  "tenant_id": "tenant456",
  "success": true,
  "ip_address": "192.168.1.100"
}
```

### 6. Error Handling

#### Secure Error Messages
- **No Information Leakage**: Generic error messages for security failures
- **Detailed Logging**: Full error details in server logs only
- **HTTP Status Codes**: Proper status codes for different error types

## Security Configuration

### Environment Variables

| Variable | Purpose | Default | Production Recommendation |
|----------|---------|---------|---------------------------|
| `JWT_SECRET` | JWT signing key | Random | Generate 256-bit key |
| `JWT_EXPIRATION_HOURS` | Access token lifetime | 1 | 1-2 hours max |
| `ALLOWED_ORIGINS` | CORS origins | localhost | Your domains only |
| `RATE_LIMIT_REQUESTS` | Requests per minute | 100 | Adjust per capacity |
| `ENABLE_AUDIT_LOGGING` | Enable audit logs | true | Always true |

### Generate Secure JWT Secret

```bash
# Generate a secure 256-bit secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## API Security

### Authentication Flow

1. **Login**: `POST /auth/login`
   - Username/password validation
   - Returns access and refresh tokens
   - Audit logging of attempts

2. **Token Refresh**: `POST /auth/refresh`
   - Refresh token validation
   - New token pair generation
   - Old token invalidation

3. **Logout**: `POST /auth/logout`
   - Token revocation
   - Blacklist current token

### Tool Access Control

```python
# Tool permissions matrix
TOOL_PERMISSIONS = {
    "bank_balance": [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN],
    "bank_transfer": [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN],
    "create_account": [UserRole.AGENT, UserRole.ADMIN],
    "freeze_account": [UserRole.AGENT, UserRole.ADMIN],
}
```

## Production Deployment Security

### Infrastructure Security

1. **HTTPS Only**: Never deploy without TLS/SSL
2. **Firewall Rules**: Restrict access to necessary ports only
3. **Container Security**: Use minimal base images
4. **Network Isolation**: Deploy in private networks

### Azure-Specific Security

1. **Azure Key Vault**: Store all secrets in Key Vault
2. **Managed Identity**: Use Azure AD for authentication
3. **Application Insights**: Enable monitoring and alerting
4. **Azure Front Door**: Add DDoS protection and WAF

### Secret Management

```bash
# Azure Key Vault integration example
az keyvault secret set --vault-name "your-keyvault" --name "jwt-secret" --value "your-secret"
```

### Monitoring & Alerting

1. **Failed Authentication**: Alert on multiple failed attempts
2. **Rate Limiting**: Monitor for potential attacks
3. **Error Rates**: Alert on unusual error patterns
4. **Performance**: Monitor response times and availability

## Security Testing

### Automated Security Testing

1. **OWASP ZAP**: Web application security scanner
2. **Bandit**: Python security linter
3. **Safety**: Check for known vulnerabilities
4. **Unit Tests**: Security-focused test cases

```bash
# Security testing commands
bandit -r src/
safety check -r requirements.txt
pytest tests/security/
```

### Manual Security Testing

1. **Token Validation**: Test with expired/invalid tokens
2. **Permission Testing**: Verify RBAC enforcement
3. **Input Validation**: Test with malicious inputs
4. **Rate Limiting**: Verify DOS protection

## Security Checklist

### Pre-Production

- [ ] Generate unique JWT secret key
- [ ] Configure specific CORS origins
- [ ] Enable audit logging
- [ ] Set up HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Run security scans
- [ ] Review all error messages
- [ ] Test authentication flows
- [ ] Verify permission controls

### Post-Deployment

- [ ] Monitor authentication failures
- [ ] Review audit logs regularly
- [ ] Update dependencies regularly
- [ ] Rotate JWT secrets periodically
- [ ] Monitor rate limiting triggers
- [ ] Review and update permissions
- [ ] Conduct regular security assessments

## Known Limitations

1. **In-Memory Storage**: Rate limiting and token revocation use memory
   - **Production Solution**: Use Redis or database
   
2. **Simplified Authentication**: Development mode accepts any credentials
   - **Production Solution**: Integrate with Azure AD or identity provider
   
3. **Basic Audit Logging**: Logs to console/stdout
   - **Production Solution**: Use structured logging to Azure Monitor

## Security Contact

For security issues or questions, contact the security team following your organization's security reporting procedures.

---

*This document should be reviewed and updated regularly as security requirements evolve.*