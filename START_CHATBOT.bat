@echo off
TITLE TMU CampusConnect — AI Assistant Server
color 0A
cd /d "%~dp0"

echo.
echo ===================================================================
echo   TMU CampusConnect — Teerthanker Mahaveer University
echo   Intelligent Campus Assistant Server
echo ===================================================================
echo.

:: 1. Check Ollama
echo [1/3] Ensuring Ollama AI service is active...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama not active. Starting background daemon...
    start "" ollama serve
    timeout /t 5 /nobreak >nul
)
echo [OK] Ollama is running.
echo.

:: 2. Locate backend folder
set BACKEND_DIR=%~dp0backend
if not exist "%BACKEND_DIR%" (
    if exist "%~dp003 - Chatbot App\backend" (
        set BACKEND_DIR=%~dp003 - Chatbot App\backend
    )
)

:: 3. Launch Server
echo [2/3] Launching TMU CampusConnect Server on http://localhost:8000 ...
cd /d "%BACKEND_DIR%"
start "TMU CampusConnect Server" cmd /k "call venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: 4. Wait and Open Browser
echo [3/3] Waiting for server to initialize...
timeout /t 6 /nobreak >nul

echo.
echo ===================================================================
echo   CHATBOT IS ONLINE!
echo.
echo   Local Admin Panel : http://localhost:8000/panel/
echo   Local Chat Widget : http://localhost:8000/widget/
echo.
echo   Default Login     : admin  /  admin123
echo ===================================================================
echo.
echo Opening Admin Panel in your browser...
start "" "http://localhost:8000/panel/"
