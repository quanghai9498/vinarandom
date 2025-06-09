@echo off
title Random-FN Setup
color 0B

echo ================================
echo     Random-FN Auto Setup
echo ================================
echo.

REM Kiem tra Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js chua duoc cai dat!
    echo Vui long tai va cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo NPM version:
npm --version
echo.

REM Chuyen den thu muc project
echo Chuyen den: D:\Random-FN
cd /d "D:\Random-FN"

REM Khoi tao npm neu chua co
if not exist "package.json" (
    echo Khoi tao package.json...
    npm init -y
    echo.
)

REM Cai dat dependencies
echo Cai dat Express va cac dependencies...
npm install express serve-favicon

echo.
echo ================================
echo     Setup hoan thanh!
echo ================================
echo Chay 'npm start' hoac 'node server.js' de khoi dong server
pause
