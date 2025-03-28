Param(
    [parameter(Mandatory=$false)][string]$webAppName=$env:WEB_APP_NAME,
    [parameter(Mandatory=$false)][string]$resourceGroup=$env:RG_NAME,
	[parameter(Mandatory=$false)][string]$webAppUrl=$env:FRONTENDPOINT_URL,
    [parameter(Mandatory=$false)][string]$apiUrl=$env:SERVICE_ChatAPI_ENDPOINT_URL
)

# Check if API URL is provided
if (-not $apiUrl) {
    Write-Host "Error: API URL is required."
    exit 1
}

# Function to upload frontend app
function Build-And-Deploy-Frontend {
    param (
        [string]$frontendPath = "..\frontend",
        [string]$webAppName,
        [string]$resourceGroup,
        [string]$buildOutput = "dist\multi-agent-app"  # Change if the output folder is different
    )

    if (-not $webAppName -or -not $resourceGroup) {
        Write-Host "Error: Web App name and Resource Group are required."
        return
    }
		
    # Switching to frontend directory
    Set-Location -Path $frontendPath
	
	# Setting ChatServiceWebApi URL in frontend app
	$envContent = "export const environment = { apiUrl: '$apiUrl/' };"
	$envFilePath = "$frontendPath\src\environments\environment.prod.ts"  # Adjust the path accordingly

	$envContent | Out-File -FilePath $envFilePath -Encoding utf8 -Force

	
    Write-Host "Installing dependencies..."
    npm install
	
    Write-Host "Building frontend..."
	ng build --configuration=production

    
    $zipFile = "..\frontend\dist\app.zip"
	
	#Delete the existing zip file if it exists
	 if (Test-Path $zipFile) {
		Remove-Item $zipFile -Force
	 }
	
	# Compressing build output
    Compress-Archive -Path "$frontendPath\$buildOutput\browser\*" -DestinationPath $zipFile -Force

	Write-Host "Deploying to Azure Web App..."
	az webapp deploy --resource-group $resourceGroup --name $webAppName --src-path $zipFile --type zip --only-show-errors
}

# Function to send data to API
function Send-Data($jsonFilePath, $endpoint) {
    if (-Not (Test-Path $jsonFilePath)) {
        Write-Host "Error: JSON file $jsonFilePath not found. Skipping."
        return
    }
    
    $apiEndpointUrl = "$apiUrl/$endpoint"
    
    # Read the JSON file as UTF-8 and parse it
    $jsonContent = Get-Content -Path $jsonFilePath -Raw -Encoding UTF8
    $jsonArray = $jsonContent | ConvertFrom-Json
    
    foreach ($item in $jsonArray) {
        try {
            $response = Invoke-RestMethod -Uri $apiEndpointUrl -Method Put -Body ($item | ConvertTo-Json -Depth 10) -ContentType "application/json"
            Write-Output "PUT $endpoint Request Successful: $response"
        } catch {
            Write-Output "Error: $_"
        }
        Start-Sleep -Milliseconds 500  # Sleep for 0.5 seconds
    }
}

# Ask user if they want to add dummy data
$dummyDataResponse = Read-Host "Do you want to add some dummy data for testing? (yes/no)"
if ($dummyDataResponse -match "^(yes|y)$") {
    Write-Host "Adding dummy data..."
    # Load dummy data
    Send-Data "./data/UserData.json" "userdata"
	Send-Data "./data/AccountsData.json" "accountdata"
	Send-Data "./data/OffersData.json" "offerdata"
}
Write-Host ""
# Ask user if they want to deploy frontend
$dummyDataResponse = Read-Host "Do you want to deploy the frontend app? (yes/no)"
if ($dummyDataResponse -match "^(yes|y)$") {
	Write-Host ""
    Write-Host "***FRONTEND APP deployment started!***"
	# Deploy frontend
	Build-And-Deploy-Frontend -webAppName $webAppName -resourceGroup $resourceGroup
	
	Write-Host ""
	Write-Host "Deployment complete. You can visit your app at : $webAppUrl"
}