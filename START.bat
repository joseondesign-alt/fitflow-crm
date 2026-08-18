@echo off
setlocal
set "FITFLOW_PORT=3100"
cd /d "%~dp0"

if not exist node_modules (
  call npm install
)

call npm run build
start "FitFlow CRM Server" cmd /k "cd /d ""%~dp0"" && npm run start -- --hostname 0.0.0.0 --port %FITFLOW_PORT%"
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:%FITFLOW_PORT%"
