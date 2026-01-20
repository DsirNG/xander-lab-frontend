@echo off
REM Xander Lab Frontend - Docker Deployment Script for Windows
REM Usage: deploy.bat [environment]
REM Example: deploy.bat production

setlocal enabledelayedexpansion

REM Configuration
set IMAGE_NAME=xander-lab-frontend
set CONTAINER_NAME=xander-lab-frontend
set PORT=30001
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo ========================================
echo   Xander Lab Frontend Deployment
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    exit /b 1
)

echo Step 1: Stopping existing container...
docker stop %CONTAINER_NAME% 2>nul
docker rm %CONTAINER_NAME% 2>nul

echo Step 2: Building Docker image...
docker build -t %IMAGE_NAME%:latest .
if errorlevel 1 (
    echo Error: Docker build failed
    exit /b 1
)

echo Step 3: Starting container...
docker run -d ^
    --name %CONTAINER_NAME% ^
    --restart unless-stopped ^
    -p %PORT%:%PORT% ^
    -e NODE_ENV=%ENVIRONMENT% ^
    %IMAGE_NAME%:latest

if errorlevel 1 (
    echo Error: Failed to start container
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Container Name: %CONTAINER_NAME%
echo Port: %PORT%
echo Environment: %ENVIRONMENT%
echo.
echo Access your application at: http://localhost:%PORT%
echo.
echo Useful commands:
echo   View logs:        docker logs -f %CONTAINER_NAME%
echo   Stop container:   docker stop %CONTAINER_NAME%
echo   Restart:          docker restart %CONTAINER_NAME%
echo   Remove:           docker rm -f %CONTAINER_NAME%
echo.

REM Wait for container to be healthy
echo Waiting for container to be healthy...
timeout /t 5 /nobreak >nul

REM Check container status
docker ps | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo Container failed to start
    echo Check logs with: docker logs %CONTAINER_NAME%
    exit /b 1
) else (
    echo Container is running successfully!
)

echo.
echo Deployment complete!

endlocal
