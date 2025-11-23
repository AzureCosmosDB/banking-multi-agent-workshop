# Script to build and push Angular frontend Docker image to Azure Container Registry
# and deploy it as a Container App

param(
    [string]$EnvironmentName = "agenthol"
)

Write-Host "Building and deploying Angular frontend container image..." -ForegroundColor Cyan

# Get ACR details
$rgName = azd env get-value RG_NAME 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }
if ([string]::IsNullOrEmpty($rgName)) {
    $rgName = "rg-$EnvironmentName"
}

$acrLoginServer = azd env get-value CONTAINER_REGISTRY_LOGIN_SERVER 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }
$acrName = azd env get-value CONTAINER_REGISTRY_NAME 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }

if ([string]::IsNullOrEmpty($acrName)) {
    $acrName = az acr list --resource-group $rgName --query "[0].name" -o tsv 2>$null
    if (-not [string]::IsNullOrEmpty($acrName)) {
        $acrLoginServer = "$acrName.azurecr.io"
    }
}

if ([string]::IsNullOrEmpty($acrLoginServer)) {
    Write-Host "Error: Could not determine ACR." -ForegroundColor Red
    exit 1
}

# Get backend API URL
$backendUrl = azd env get-value MULTIAGENTCOPILOT_CONTAINERAPP_URL 2>&1 | Where-Object { $_ -notmatch 'ERROR' } | ForEach-Object { $_.ToString().Trim() }
if ([string]::IsNullOrEmpty($backendUrl)) {
    $backendUrl = "https://ca-agenthol-multiagentcopilot.happyforest-906a87b9.eastus.azurecontainerapps.io"
}

Write-Host "ACR: $acrName" -ForegroundColor Green
Write-Host "Backend API URL: $backendUrl" -ForegroundColor Green

# Update environment.prod.ts with the backend URL
$envProdContent = @"
export const environment = {
  production: true,
  apiUrl: '$backendUrl/'
};
"@
Set-Content -Path "frontend/src/environments/environment.prod.ts" -Value $envProdContent
Write-Host "Updated environment.prod.ts with backend URL" -ForegroundColor Green

# Check Docker
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running." -ForegroundColor Red
    exit 1
}

# Login to ACR
Write-Host "`nLogging in to Azure Container Registry..." -ForegroundColor Cyan
az acr login --name $acrName

# Build the Docker image
Write-Host "`nBuilding Docker image..." -ForegroundColor Cyan
$imageTag = "$acrLoginServer/frontend:latest"
$dockerfilePath = "frontend/Dockerfile"
$buildContext = "frontend"

docker build -f $dockerfilePath -t $imageTag $buildContext

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

# Push the image
Write-Host "`nPushing image to Azure Container Registry..." -ForegroundColor Cyan
docker push $imageTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker push failed." -ForegroundColor Red
    exit 1
}

Write-Host "`nImage built and pushed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create a Container App for the frontend (or update existing if you have one)" -ForegroundColor Yellow
Write-Host "2. Configure it to use the image: $imageTag" -ForegroundColor Yellow
Write-Host "3. Set target port to 80" -ForegroundColor Yellow

