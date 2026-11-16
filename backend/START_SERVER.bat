@echo off
TITLE TMU CampusConnect Server
color 0A
cd /d "%~dp0"

echo.
echo ===================================================
echo  TMU CampusConnect - Starting...
echo  Teerthanker Mahaveer University AI Assistant
echo ===================================================
echo.

echo [Step 1 of 3] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama not running. Starting now...
    start "" ollama serve
    echo Waiting 15 seconds for Ollama to load...
    ping 127.0.0.1 -n 16 >nul
)
echo Ollama running. OK
echo.

echo [Step 2 of 3] Starting TMU CampusConnect Server...
start "TMU CampusConnect" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
ping 127.0.0.1 -n 13 >nul
echo TMU CampusConnect server started. OK
echo.

echo [Step 3 of 3] Starting Internet Access (ngrok)...
if exist "%~dp0ngrok.exe" (
    start "ngrok Tunnel" cmd /k ""%~dp0ngrok.exe" http 8000 --domain=unstuffed-flyover-answering.ngrok-free.dev"
    ping 127.0.0.1 -n 6 >nul
    echo ngrok tunnel started. OK
) else (
    echo ngrok.exe not found. Internet access unavailable.
)

echo.
echo ===================================================
echo  ALL DONE - TMU CampusConnect is running!
echo.
echo  LOCAL (this PC only):
echo    Admin Panel  = http://localhost:8000/panel/
echo    Chat Widget  = http://localhost:8000/widget/
echo.
echo  INTERNET (from anywhere in the world):
echo    Admin Panel  = https://unstuffed-flyover-answering.ngrok-free.dev/panel/
echo    Chat Widget  = https://unstuffed-flyover-answering.ngrok-free.dev/widget/
echo.
echo  This URL is PERMANENT - share it freely!
echo  Login: admin / admin123
echo  IMPORTANT: Change password after first login!
echo.
echo  Do NOT close this window.
echo ===================================================
echo.
echo Press any key to open the Admin Panel...
pause >nul
start "" http://localhost:8000/panel/
