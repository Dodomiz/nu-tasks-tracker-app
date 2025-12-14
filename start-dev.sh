#!/bin/bash

# NU Tasks Tracker - Development Server Startup Script
# This script runs both backend (.NET) and frontend (React) concurrently

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting NU Tasks Tracker Application...${NC}\n"

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}❌ .NET SDK not found. Please install .NET 9 SDK.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+.${NC}"
    exit 1
fi

# Install web dependencies if node_modules doesn't exist
if [ ! -d "web/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing web dependencies...${NC}"
    cd web && npm install && cd ..
fi

# Create log directory if it doesn't exist
mkdir -p logs

echo -e "${GREEN}✅ Prerequisites check passed${NC}\n"
echo -e "${YELLOW}Starting backend API on https://localhost:7001${NC}"
echo -e "${YELLOW}Starting frontend on http://localhost:5173${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Trap SIGINT and SIGTERM to kill all child processes
trap 'echo -e "\n${RED}Stopping servers...${NC}"; kill 0' SIGINT SIGTERM

# Start backend in background
cd backend/src/TasksTracker.Api
dotnet watch run > ../../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../../..

# Wait a bit for backend to start
sleep 2

# Start frontend in background
cd web
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Display logs
echo -e "${GREEN}📝 Tailing logs (Ctrl+C to stop)...${NC}\n"
echo -e "${YELLOW}Backend PID: $BACKEND_PID${NC}"
echo -e "${YELLOW}Frontend PID: $FRONTEND_PID${NC}\n"

# Follow both logs
tail -f logs/backend.log logs/frontend.log

# Wait for background processes
wait
