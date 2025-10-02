# Banking MCP Server

This is a standalone HTTP-based MCP (Model Context Protocol) server for banking operations. It provides secure, OAuth2-authenticated access to banking tools via HTTP endpoints.

## Architecture

The MCP server exposes banking functionality through RESTful HTTP endpoints instead of the traditional stdio-based MCP protocol. This allows for:

- **Scalability**: Deploy as Azure Container Apps with auto-scaling
- **Security**: OAuth2/JWT token-based authentication
- **Monitoring**: Built-in health checks and metrics
- **Integration**: Easy integration with existing web applications

## Features

### Banking Operations
- **Account Management**: Balance checking, account creation
- **Transactions**: Money transfers, transaction history
- **Customer Service**: Service request creation, branch locations
- **Product Information**: Offer searches using AI embeddings
- **Loan Calculations**: Monthly payment calculations

### Security
- **JWT Authentication**: Access and refresh tokens with expiration
- **Role-Based Access Control**: Admin, customer, agent, and read-only roles
- **Input Validation**: Comprehensive sanitization and validation
- **Rate Limiting**: DOS protection with configurable limits
- **Audit Logging**: Security event tracking and monitoring
- **CORS Security**: Strict origin and method controls
- **Password Security**: PBKDF2 hashing with salt
- **Token Revocation**: Blacklist support for compromised tokens

> 📋 See [SECURITY.md](SECURITY.md) for detailed security documentation

### Infrastructure
- Azure Container Apps deployment
- Azure Cosmos DB integration
- Azure OpenAI integration
- Managed identity authentication
- Auto-scaling and load balancing

## API Endpoints

### Authentication
- `POST /auth/login` - Authenticate with username/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke token
- `POST /auth/token` - Development token endpoint (remove in production)

### Health & Discovery
- `GET /health` - Health check endpoint
- `GET /tools` - List available banking tools

### Tool Execution
- `POST /tools/call` - Execute a banking tool

## Usage

### 1. Local Development

```bash
# Navigate to mcpserver directory
cd mcpserver

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export COSMOSDB_ENDPOINT="your-cosmos-endpoint"
export AZURE_OPENAI_ENDPOINT="your-openai-endpoint"
export AZURE_OPENAI_EMBEDDINGDEPLOYMENTID="text-embedding-3-small"
export JWT_SECRET="your-jwt-secret"

# Run the server (from mcpserver root directory with correct PYTHONPATH)
PYTHONPATH=src python -m uvicorn src.mcp_http_server:app --host 0.0.0.0 --port 8080
```

### 2. Azure Deployment

The server is automatically deployed as part of the main infrastructure:

```bash
# Deploy using Azure Developer CLI
azd up
```

This will:
1. Create Azure Container Apps environment
2. Deploy the MCP server container
3. Configure managed identity and role assignments
4. Update the main application's .env file with the MCP server endpoint

### 3. Client Integration

The Python application automatically detects and uses the HTTP MCP server when `USE_REMOTE_MCP_SERVER=true` is set in the environment.

```python
# The MCP client automatically switches between direct and HTTP modes
from src.app.tools.mcp_client import get_shared_mcp_client

# Get client (automatically uses HTTP if configured)
client = await get_shared_mcp_client()

# Get tools
tools = await client.get_tools()

# Call a tool
result = await client.call_tool("bank_balance", {
    "account_number": "Acc001",
    "tenantId": "Contoso",
    "userId": "Mark"
})
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COSMOSDB_ENDPOINT` | Azure Cosmos DB endpoint | Yes |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | Yes |
| `AZURE_OPENAI_EMBEDDINGDEPLOYMENTID` | Embedding model deployment ID | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `PORT` | Server port (default: 8080) | No |
| `USE_REMOTE_MCP_SERVER` | Enable Remote MCP mode in client | No |

### Client Configuration

The main Python application uses these additional environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_SERVER_ENDPOINT` | HTTP MCP server URL | `http://localhost:8080` |
| `USE_REMOTE_MCP_SERVER` | Use Remote MCP server instead of Local calls | `false` |

## Security Considerations

### Production Deployment
1. Replace development JWT secret with secure random key
2. Integrate with Azure AD for proper OAuth2 flow
3. Configure proper CORS policies
4. Enable HTTPS only
5. Set up proper monitoring and logging

### Authentication Flow
```
Client → POST /auth/token → JWT Token
Client → GET /tools (with Bearer token) → Tool list
Client → POST /tools/call (with Bearer token) → Tool result
```

## Monitoring

### Health Checks
- `GET /health` returns server status
- Built-in container health checks
- Azure Container Apps health probes

### Logging
- Structured logging for all operations
- Azure Application Insights integration
- Performance metrics and timing

## Development

### Adding New Tools
1. Implement the tool function in `mcp_http_server.py`
2. Add to `TOOL_REGISTRY` and `TOOL_DEFINITIONS`
3. Update API documentation

### Testing
```bash
# Test health endpoint
curl http://localhost:8080/health

# Get auth token
curl -X POST http://localhost:8080/auth/token

# List tools
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/tools

# Call a tool
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool_name":"bank_balance","arguments":{"account_number":"Acc001"},"tenant_id":"Contoso","user_id":"Mark"}' \
  http://localhost:8080/tools/call
```

## Migration from stdio MCP

The HTTP MCP server maintains full compatibility with the original stdio-based tools:

- All tool signatures remain the same
- Parameter validation is preserved
- Error handling behavior is consistent
- Context injection (tenant/user IDs) works identically

The client automatically switches between direct and HTTP modes based on configuration, ensuring zero-impact migration.

## Production Security Setup

### 1. Generate Secure JWT Secret

```bash
# Generate a cryptographically secure secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
# Security settings
JWT_SECRET=your-generated-256-bit-secret
ALLOWED_ORIGINS=https://yourdomain.com
ENABLE_AUDIT_LOGGING=true

# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60
```

### 3. Azure Key Vault Integration

```bash
# Store secrets in Azure Key Vault
az keyvault secret set --vault-name "your-keyvault" --name "jwt-secret" --value "your-secret"
az keyvault secret set --vault-name "your-keyvault" --name "cosmos-key" --value "your-cosmos-key"
```

### 4. Enable HTTPS

- Configure TLS certificates
- Use Azure Front Door for SSL termination
- Redirect HTTP to HTTPS

### 5. Monitor Security Events

- Enable Application Insights
- Set up alerts for authentication failures
- Monitor rate limiting triggers

## Security Testing

```bash
# Install security tools
pip install bandit safety

# Run security scans
bandit -r src/
safety check -r requirements.txt

# Test authentication
pytest tests/security/
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify JWT_SECRET is set correctly
   - Check token expiration (default 1 hour)
   - Ensure proper Authorization header format: `Bearer <token>`

2. **Permission Errors**
   - Check user roles in JWT token
   - Verify tool permissions in TOOL_PERMISSIONS
   - Review audit logs for authorization failures

3. **Rate Limiting**
   - Monitor rate limit headers in responses
   - Adjust RATE_LIMIT_REQUESTS if needed
   - Implement client-side retry logic

4. **Azure Service Connection Issues**
   - Verify managed identity has proper role assignments
   - Check Azure resource endpoints in environment variables
   - Confirm network connectivity from Container Apps

3. **Tool Execution Errors**
   - Check tenant/user ID context injection
   - Verify required parameters are provided
   - Review Azure Cosmos DB and OpenAI service health

### Logs and Monitoring
- Container logs: Available in Azure Container Apps console
- Application Insights: Detailed telemetry and performance data
- Health endpoint: Real-time server status