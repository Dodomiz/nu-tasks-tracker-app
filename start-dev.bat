@echo off
REM NU Tasks Tracker - Development Server Startup Script (Windows)
REM This script runs both backend (.NET) and frontend (React) concurrently

echo.
echo Starting NU Tasks Tracker Application...
echo.

REM Check if .NET is installed
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: .NET SDK not found. Please install .NET 9 SDK.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js 18+.
    exit /b 1
)

REM Install web dependencies if node_modules doesn't exist
if not exist "web\node_modules" (
    echo Installing web dependencies...
    cd web
    call npm install
    cd ..
)

REM Create log directory if it doesn't exist
if not exist "logs" mkdir logs

echo.
echo Prerequisites check passed
echo.
echo Starting backend API on https://localhost:7001
echo Starting frontend on http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend and frontend in separate windows
start "Backend API" cmd /c "cd backend\src\TasksTracker.Api && dotnet watch run"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /c "cd web && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Close those windows to stop the servers.
echo.
