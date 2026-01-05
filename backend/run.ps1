# Load .env file and run Spring Boot
# Usage: ./run.ps1

Write-Host "Loading .env file..." -ForegroundColor Cyan

if (Test-Path .env) {
    # First pass: Load all variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=#]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
    
    # Get DB_STATUS
    $dbStatus = [System.Environment]::GetEnvironmentVariable("DB_STATUS")
    
    if ($dbStatus -eq "cloud") {
        Write-Host "" -ForegroundColor Cyan
        Write-Host "Using CLOUD database (Neon DB)" -ForegroundColor Cyan
        $cloudUrl = [System.Environment]::GetEnvironmentVariable("CLOUD_DATABASE_URL")
        $cloudUser = [System.Environment]::GetEnvironmentVariable("CLOUD_DATABASE_USERNAME")
        $cloudPass = [System.Environment]::GetEnvironmentVariable("CLOUD_DATABASE_PASSWORD")
        
        [System.Environment]::SetEnvironmentVariable("DATABASE_URL", $cloudUrl)
        [System.Environment]::SetEnvironmentVariable("DATABASE_USERNAME", $cloudUser)
        [System.Environment]::SetEnvironmentVariable("DATABASE_PASSWORD", $cloudPass)
        
        Write-Host "  Database: Neon DB (Cloud)" -ForegroundColor Green
    } elseif ($dbStatus -eq "local") {
        Write-Host "" -ForegroundColor Cyan
        Write-Host "Using LOCAL database" -ForegroundColor Cyan
        $localUrl = [System.Environment]::GetEnvironmentVariable("LOCAL_DATABASE_URL")
        $localUser = [System.Environment]::GetEnvironmentVariable("LOCAL_DATABASE_USERNAME")
        $localPass = [System.Environment]::GetEnvironmentVariable("LOCAL_DATABASE_PASSWORD")
        
        [System.Environment]::SetEnvironmentVariable("DATABASE_URL", $localUrl)
        [System.Environment]::SetEnvironmentVariable("DATABASE_USERNAME", $localUser)
        [System.Environment]::SetEnvironmentVariable("DATABASE_PASSWORD", $localPass)
        
        Write-Host "  Database: PostgreSQL (Local)" -ForegroundColor Green
    } else {
        Write-Host "" -ForegroundColor Yellow
        Write-Host "DB_STATUS not set or invalid. Using default from .env" -ForegroundColor Yellow
    }
    
    Write-Host "" -ForegroundColor Green
    Write-Host "Environment variables loaded!" -ForegroundColor Green
} else {
    Write-Host "No .env file found, using defaults from application.properties" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor Cyan
Write-Host "Starting Spring Boot..." -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
./mvnw spring-boot:run
