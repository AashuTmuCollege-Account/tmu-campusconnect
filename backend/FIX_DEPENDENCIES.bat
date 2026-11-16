@echo off
TITLE Fix Dependencies
color 0E

echo.
echo =====================================================
echo   Fixing Python dependencies...
echo   This will take about 2-3 minutes.
echo =====================================================
echo.

cd /d %~dp0

echo [1/3] Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Could not activate virtual environment.
    echo Please run SETUP.bat first, then try again.
    pause
    exit /b 1
)

echo [2/3] Removing old incompatible bcrypt...
pip uninstall bcrypt passlib -y

echo [3/3] Installing correct versions...
pip install bcrypt==3.2.2 passlib==1.7.4

echo.
echo =====================================================
echo   DONE! Dependencies fixed.
echo   Now run START_SERVER.bat to start the chatbot.
echo =====================================================
echo.
pause
