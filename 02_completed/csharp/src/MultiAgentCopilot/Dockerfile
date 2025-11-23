# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# Stage 1: Build Angular frontend
FROM node:20-alpine AS angular-build
WORKDIR /app/frontend
# Copy frontend (build context is now 02_completed directory)
COPY ["frontend/package*.json", "./"]
RUN npm install
COPY frontend/ .
# Build Angular app for production (use production configuration)
RUN npm run build -- --configuration production

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
# Create a nuget.config that only uses nuget.org (no private feeds)
RUN echo '<?xml version="1.0" encoding="utf-8"?><configuration><packageSources><clear /><add key="nuget.org" value="https://api.nuget.org/v3/index.json" /></packageSources></configuration>' > nuget.config
COPY ["csharp/src/MultiAgentCopilot/MultiAgentCopilot.csproj", "MultiAgentCopilot/"]
RUN dotnet restore "./MultiAgentCopilot/MultiAgentCopilot.csproj"
COPY csharp/src/ .
WORKDIR "/src/MultiAgentCopilot"
RUN dotnet build "./MultiAgentCopilot.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./MultiAgentCopilot.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Copy Angular build output to wwwroot
COPY --from=angular-build /app/frontend/dist/multi-agent-app/browser ./wwwroot
ENTRYPOINT ["dotnet", "MultiAgentCopilot.dll"]