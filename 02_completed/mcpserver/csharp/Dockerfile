# Use the official .NET 10 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the .NET 10 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Build with the workshop tree (02_completed) as the Docker context.
COPY ["mcpserver/csharp/MCPServer.csproj", "mcpserver/csharp/"]
COPY ["csharp/src/Banking/Banking.csproj", "csharp/src/Banking/"]
RUN dotnet restore "mcpserver/csharp/MCPServer.csproj"

COPY mcpserver/csharp/ mcpserver/csharp/
COPY csharp/src/Banking/ csharp/src/Banking/
WORKDIR "/src/mcpserver/csharp"
RUN dotnet build "MCPServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MCPServer.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MCPServer.dll"]