@echo off
echo ====================================
echo   Employee Portal - Starting...
echo ====================================
echo.

REM Check if node_modules exists in server
if not exist "employee-portal-server\node_modules" (
    echo [1/3] Installing server dependencies...
    cd employee-portal-server
    call npm install
    cd ..
    echo.
) else (
    echo [1/3] Server dependencies already installed
    echo.
)

REM Check if node_modules exists in client
if not exist "employee-portal-client\node_modules" (
    echo [2/3] Installing client dependencies...
    cd employee-portal-client
    call npm install
    cd ..
    echo.
) else (
    echo [2/3] Client dependencies already installed
    echo.
)

REM Build the client
echo [3/3] Building client...
cd employee-portal-client
call npm run build
cd ..
echo.

REM Start the server
echo ====================================
echo   Starting server...
echo   Server will run on http://localhost:5000
echo   Press Ctrl+C to stop
echo ====================================
echo.

cd employee-portal-server
npm start

