@echo off
setlocal
cd /d "%~dp0"

:: Configuration
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set ASSET_MANAGER_URL="http://localhost:3000"

echo ========================================
echo   Launching Asset Manager...
echo ========================================

:: Start Server
echo 1. Starting Asset Manager server...
start "Asset Manager Server" cmd /k "node 00_WorkSpace\asset-manager\server.js"

:: Wait for server
echo 2. Waiting for server to initialize (3s)...
timeout /t 3 /nobreak > nul

:: Open Chrome
echo 3. Opening Chrome...
if exist %CHROME_PATH% (
    start "" %CHROME_PATH% %ASSET_MANAGER_URL%
) else (
    start "" %ASSET_MANAGER_URL%
)

echo Done!
exit
