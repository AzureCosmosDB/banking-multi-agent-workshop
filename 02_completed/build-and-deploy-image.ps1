# Script to build and push MultiAgentCopilot Docker image to Azure Container Registry
# and update the Container App to use it
# Uses local Docker to build, then pushes to ACR

param(
    [string]$EnvironmentName = "agenthol"
)

Write-Host "Building and deploying MultiAgentCopilot container image using Docker..." -ForegroundColor Cyan

# Get resource group name first
$rgName = azd env get-value RG_NAME 2>$null
if ([string]::IsNullOrEmpty($rgName)) {
    $rgName = "rg-$EnvironmentName"
}

# Get ACR details - try from azd env first, then fallback to Azure query
$acrLoginServer = azd env get-value CONTAINER_REGISTRY_LOGIN_SERVER 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }
$acrName = azd env get-value CONTAINER_REGISTRY_NAME 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }
$containerAppName = azd env get-value MULTIAGENTCOPILOT_CONTAINERAPP_NAME 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }

# If ACR name not found in env, query Azure directly
if ([string]::IsNullOrEmpty($acrName) -or $acrName -match 'ERROR') {
    Write-Host "ACR name not found in azd environment. Querying Azure..." -ForegroundColor Yellow
    $acrName = az acr list --resource-group $rgName --query "[0].name" -o tsv 2>$null
    
    if ([string]::IsNullOrEmpty($acrName)) {
        Write-Host "Error: Could not find ACR in resource group $rgName" -ForegroundColor Red
        exit 1
    }
    
    $acrLoginServer = "$acrName.azurecr.io"
    Write-Host "Found ACR: $acrName" -ForegroundColor Green
} elseif ([string]::IsNullOrEmpty($acrLoginServer) -or $acrLoginServer -match 'ERROR') {
    # Extract login server from ACR name
    if (-not [string]::IsNullOrEmpty($acrName)) {
        $acrLoginServer = "$acrName.azurecr.io"
    } else {
        Write-Host "Error: Could not determine ACR login server." -ForegroundColor Red
        exit 1
    }
}

Write-Host "ACR Login Server: $acrLoginServer" -ForegroundColor Green
Write-Host "ACR Name: $acrName" -ForegroundColor Green
Write-Host "Container App Name: $containerAppName" -ForegroundColor Green

# Validate ACR name
if ($acrName.Length -lt 5 -or $acrName.Length -gt 50) {
    Write-Host "Error: ACR name '$acrName' is invalid. Must be between 5 and 50 characters." -ForegroundColor Red
    exit 1
}

if ($acrName -notmatch '^[a-z0-9]+$') {
    Write-Host "Error: ACR name '$acrName' contains invalid characters. Only lowercase letters and numbers allowed." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "`nChecking Docker..." -ForegroundColor Cyan
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running or not installed." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "Make sure Docker Desktop is running and try again." -ForegroundColor Yellow
    exit 1
}

# Login to ACR
Write-Host "Logging in to Azure Container Registry..." -ForegroundColor Cyan
az acr login --name $acrName

# Build the Docker image locally
Write-Host "`nBuilding Docker image locally..." -ForegroundColor Cyan
$imageTag = "$acrLoginServer/multiagentcopilot:latest"
$dockerfilePath = "csharp/src/MultiAgentCopilot/Dockerfile"
# Build context needs to be the parent directory to access both csharp/src and frontend
$buildContext = "."

docker build -f $dockerfilePath -t $imageTag $buildContext

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

# Push the image to ACR
Write-Host "`nPushing image to Azure Container Registry..." -ForegroundColor Cyan
docker push $imageTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker push failed." -ForegroundColor Red
    exit 1
}

Write-Host "`nImage built and pushed successfully!" -ForegroundColor Green

# Update Container App to use the new image
if (-not [string]::IsNullOrEmpty($containerAppName)) {
    Write-Host "`nUpdating Container App to use the new image..." -ForegroundColor Cyan
    
    # Get resource group name
    $rgName = azd env get-value RG_NAME 2>$null
    if ([string]::IsNullOrEmpty($rgName)) {
        $rgName = "rg-$EnvironmentName"
    }
    
    # Update the container app image and port (real app listens on 8080)
    Write-Host "Updating Container App image and port configuration..." -ForegroundColor Cyan
    
    # Update the image
    az containerapp update `
        --name $containerAppName `
        --resource-group $rgName `
        --image $imageTag `
        --query "properties.template.containers[0].image" `
        --output tsv
    
    # Update the ingress target port separately
    az containerapp ingress update `
        --name $containerAppName `
        --resource-group $rgName `
        --target-port 8080 `
        --type external `
        --transport auto `
        --output none
    
    Write-Host "`nContainer App updated successfully!" -ForegroundColor Green
    Write-Host "The Container App will restart with the new image on port 8080. This may take a few minutes." -ForegroundColor Yellow
} else {
    Write-Host "`nWarning: Could not get Container App name. Please update manually:" -ForegroundColor Yellow
    Write-Host "az containerapp update --name <container-app-name> --resource-group <rg-name> --image $imageTag" -ForegroundColor Yellow
}

Write-Host "`nDone! Your MultiAgentCopilot application should be running shortly." -ForegroundColor Green

