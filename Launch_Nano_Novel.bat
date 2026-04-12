@echo off
setlocal
cd /d "%~dp0"

:: Configuration
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set DEV_URL="http://localhost:5173"

echo ========================================
echo   Launching NanoNovel...
echo ========================================

:: Start Dev Server
echo 1. Starting Vite development server...
start "NanoNovel Dev Server" cmd /k "npm run dev"

:: Wait for server
echo 2. Waiting for server to initialize (5s)...
timeout /t 5 /nobreak > nul

:: Open Chrome
echo 3. Opening Chrome...
if exist %CHROME_PATH% (
    start "" %CHROME_PATH% %DEV_URL%
) else (
    echo [WARNING] Chrome not found at %CHROME_PATH%. 
    echo Opening default browser instead.
    start "" %DEV_URL%
)

echo Done!
exit
