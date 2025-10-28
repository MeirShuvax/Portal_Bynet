@echo off
echo ====================================
echo   Employee Portal - Development Mode
echo ====================================
echo.
echo This will start:
echo   - Server on http://localhost:5000
echo   - Client on http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop
echo.

REM Check and install server dependencies
if not exist "employee-portal-server\node_modules" (
    echo Installing server dependencies...
    cd employee-portal-server
    call npm install
    cd ..
)

REM Check and install client dependencies
if not exist "employee-portal-client\node_modules" (
    echo Installing client dependencies...
    cd employee-portal-client
    call npm install
    cd ..
)

echo.
echo Starting Server (will open in new window)...
start "Employee Portal - Server" cmd /k "cd employee-portal-server && npm start"

timeout /t 3 /nobreak >nul

echo Starting Client (will open in new window)...
start "Employee Portal - Client" cmd /k "cd employee-portal-client && npm start"

echo.
echo ====================================
echo   Both servers are starting...
echo   Check the windows that opened
echo ====================================
echo.
pause

