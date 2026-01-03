# Load .env file and run Spring Boot
# Usage: ./run.ps1

Write-Host "Loading .env file..." -ForegroundColor Cyan

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=#]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value)
            Write-Host "  Set $name" -ForegroundColor Gray
        }
    }
    Write-Host "Environment variables loaded!" -ForegroundColor Green
} else {
    Write-Host "No .env file found, using defaults from application.properties" -ForegroundColor Yellow
}

Write-Host "`nStarting Spring Boot..." -ForegroundColor Cyan
./mvnw spring-boot:run
