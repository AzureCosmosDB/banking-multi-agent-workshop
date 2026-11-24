FROM mcr.microsoft.com/dotnet/sdk:10.0

# Set working directory inside the container
WORKDIR /workspace

# Copy the project files into the container
COPY . .

# Restore dependencies
RUN dotnet restore src/MultiAgentCopilot/MultiAgentCopilot.csproj

# Build the project
RUN dotnet build src/MultiAgentCopilot/MultiAgentCopilot.csproj --configuration Release --no-restore

# Run the application
CMD ["dotnet", "run", "--project", "src/MultiAgentCopilot/MultiAgentCopilot.csproj"]
