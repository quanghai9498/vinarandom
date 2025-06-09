@echo off
echo Khoi dong Random-FN Server...

REM Chuyen den thu muc project
cd /d "D:\Random-FN"
cscript //nologo start-silent.vbs
start /min npm start
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "silent-start.ps1"

REM Kiem tra package.json va node_modules
if not exist "package.json" (
    echo Dang khoi tao npm...
    npm init -y
)

if not exist "node_modules" (
    echo Dang cai dat dependencies...
    npm install express serve-favicon
)

REM Khoi dong server
echo Server dang khoi dong tai http://localhost:3000
npm start
