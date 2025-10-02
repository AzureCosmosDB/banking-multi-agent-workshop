# Use an official Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# Copy the source code
COPY src/ ./src/

# Expose the required port
EXPOSE 8080

# Set the PYTHONPATH to ensure `src` is found
ENV PYTHONPATH=/app

# Set environment variable for Remote MCP mode
ENV USE_REMOTE_MCP_SERVER=true

# Set JWT secret for production (change this in production)
ENV JWT_SECRET=your-production-secret-key-change-this

# Run the HTTP MCP server
CMD ["python", "src/mcp_http_server.py"]