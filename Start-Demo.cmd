@echo off
cd /d "%~dp0"
set "DEMO_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "DEMO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "node_modules\vite\bin\vite.js" (
  echo Install dependencies first: npm install
  pause
  exit /b 1
)
echo Starting Nexora Business OS Demo...
echo Open the Local URL shown below. Press Ctrl+C to stop.
"%DEMO_NODE%" node_modules\vite\bin\vite.js --host 127.0.0.1
pause
