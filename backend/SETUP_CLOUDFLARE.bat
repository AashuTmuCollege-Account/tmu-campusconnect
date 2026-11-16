@echo off
TITLE Cloudflare Tunnel Setup
color 0B
cd /d %~dp0

echo.
echo ===================================================
echo  TMU Chatbot - Internet Access Setup
echo  (Cloudflare Quick Tunnel - FREE, No Domain Needed)
echo ===================================================
echo.
echo This will make your chatbot accessible from
echo ANYWHERE in the world using a FREE Cloudflare URL.
echo.
echo You do NOT need:
echo   - A domain name
echo   - A paid account
echo   - Any login or authorization
echo.
echo Press any key to continue...
pause >nul

:: ── Step 1: Find or Install cloudflared ──────────────────────────────────────
echo.
echo [Step 1 of 2] Finding cloudflared...
echo.

:: Try PATH first
where cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo cloudflared already installed in PATH. OK
    goto :refresh_done
)

:: Try common install locations from winget
set CF_EXE=
if exist "C:\Program Files\Cloudflare\cloudflared\cloudflared.exe" (
    set CF_EXE=C:\Program Files\Cloudflare\cloudflared\cloudflared.exe
    echo Found at: %CF_EXE%
    goto :found_cf
)

:: Search in WinGet packages folder
for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Cloudflare.cloudflared*") do (
    if exist "%%D\cloudflared.exe" (
        set CF_EXE=%%D\cloudflared.exe
        echo Found at: %%D\cloudflared.exe
        goto :found_cf
    )
)

:: Not found - install now
echo cloudflared not found. Installing now via winget...
echo (This downloads 18 MB - takes about 1 minute)
echo.
winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements
echo.

:: After winget install, refresh and check common paths
where cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo Installed and found in PATH. OK
    goto :refresh_done
)

:: Check again in Program Files after install
if exist "C:\Program Files\Cloudflare\cloudflared\cloudflared.exe" (
    set CF_EXE=C:\Program Files\Cloudflare\cloudflared\cloudflared.exe
    echo Found at: %CF_EXE%
    goto :found_cf
)

:: Last resort: ask user to copy it
echo.
echo ===================================================
echo  cloudflared installed but not found in PATH yet.
echo  This happens because Windows needs a fresh window.
echo.
echo  EASY FIX:
echo  1. CLOSE this window
echo  2. Double-click SETUP_CLOUDFLARE.bat again
echo     (the PATH will be refreshed automatically)
echo ===================================================
echo.
pause
exit /b 1

:found_cf
:: Copy to System32 so it's always in PATH
echo Copying cloudflared to System32 for easy access...
copy /y "%CF_EXE%" "C:\Windows\System32\cloudflared.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo Copied to C:\Windows\System32\cloudflared.exe OK
    set CF_EXE=cloudflared
) else (
    echo Note: Could not copy to System32 (need admin). Using full path.
)
goto :step2

:refresh_done
set CF_EXE=cloudflared

:: ── Step 2: Create Quick Tunnel start script ──────────────────────────────────
:step2
echo.
echo [Step 2 of 2] Creating your tunnel startup file...
echo.

:: Create the QUICK_START_CLOUDFLARE.bat
(
echo @echo off
echo TITLE TMU Chatbot - Internet Access ^(Cloudflare Tunnel^)
echo color 0A
echo cd /d %%~dp0
echo.
echo echo.
echo echo ===================================================
echo echo  TMU Chatbot - Starting Internet Access...
echo echo ===================================================
echo echo.
echo echo First making sure the chatbot server is running...
echo %CF_EXE% --version ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo ERROR: cloudflared not found. Run SETUP_CLOUDFLARE.bat first.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo Starting Cloudflare Quick Tunnel...
echo echo.
echo echo ===================================================
echo echo  YOUR PUBLIC URL WILL APPEAR BELOW IN 5 SECONDS
echo echo.
echo echo  It will look like:
echo echo  https://xxxx-xxxx-xxxx.trycloudflare.com
echo echo.
echo echo  SHARE THESE LINKS WITH ANYONE:
echo echo  Admin Panel: https://xxxx.trycloudflare.com/panel/
echo echo  Chat Widget: https://xxxx.trycloudflare.com/widget/
echo echo.
echo echo  NOTE: The URL changes every time you restart.
echo echo  Copy it fresh each time you start the tunnel.
echo echo ===================================================
echo echo.
echo %CF_EXE% tunnel --url http://localhost:8000
echo.
echo pause
) > "%~dp0QUICK_START_CLOUDFLARE.bat"

echo Created QUICK_START_CLOUDFLARE.bat OK

:: ── Also update START_SERVER.bat to launch Quick Tunnel automatically ─────────
(
echo @echo off
echo TITLE University AI Chatbot Server
echo color 0A
echo cd /d %%~dp0
echo.
echo echo.
echo echo ===================================================
echo echo  TMU University AI Chatbot - Starting...
echo echo ===================================================
echo echo.
echo.
echo echo [Step 1 of 3] Checking Ollama...
echo %CF_EXE% --version ^>nul 2^>^&1
echo curl -s http://localhost:11434/api/tags ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo Ollama is not running. Starting it now...
echo     start "" ollama serve
echo     echo Waiting 15 seconds for Ollama to load...
echo     ping 127.0.0.1 -n 16 ^>nul
echo ^)
echo curl -s http://localhost:11434/api/tags ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo ERROR: Ollama did not start. Open Ollama from Start Menu first.
echo     pause
echo     exit /b 1
echo ^)
echo echo Ollama is running. OK
echo echo.
echo.
echo echo [Step 2 of 3] Starting Chatbot Server...
echo start "UniBot Server" cmd /k "cd /d %%~dp0 ^&^& call venv\Scripts\activate ^&^& python -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo ping 127.0.0.1 -n 13 ^>nul
echo echo Chatbot server started. OK
echo echo.
echo.
echo echo [Step 3 of 3] Starting Cloudflare Internet Access...
echo where cloudflared ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8000"
echo     ping 127.0.0.1 -n 8 ^>nul
echo     echo Cloudflare tunnel started. Check the Cloudflare window for your public URL.
echo ^) else ^(
echo     echo Cloudflare not set up. Run SETUP_CLOUDFLARE.bat to enable internet access.
echo ^)
echo.
echo echo.
echo echo ===================================================
echo echo  ALL DONE - TMU Chatbot is running!
echo echo.
echo echo  LOCAL Access ^(this PC only^):
echo echo  Admin Panel  = http://localhost:8000/panel/
echo echo  Chat Widget  = http://localhost:8000/widget/
echo echo.
echo echo  INTERNET Access ^(from anywhere^):
echo echo  Check the ORANGE Cloudflare window for your URL!
echo echo  It looks like: https://xxxx.trycloudflare.com
echo echo.
echo echo  AI Model  = llama3.2:3b ^(replies in 60-90 sec^)
echo echo  Login     = admin / admin123
echo echo  IMPORTANT: Change this password after first login!
echo echo.
echo echo  Do NOT close this window.
echo echo ===================================================
echo echo.
echo echo Press any key to open the Admin Panel...
echo pause ^>nul
echo start "" http://localhost:8000/panel/
) > "%~dp0START_SERVER.bat"

echo Updated START_SERVER.bat to include tunnel. OK

:: ── Show final instructions ────────────────────────────────────────────────────
echo.
echo ===================================================
echo  SETUP COMPLETE!
echo ===================================================
echo.
echo HOW TO USE (do these in order every time):
echo.
echo   STEP 1: Double-click START_SERVER.bat
echo           (starts Ollama + Chatbot + Cloudflare tunnel)
echo.
echo   STEP 2: Look at the ORANGE/black Cloudflare window
echo           Your URL will appear like:
echo           https://abc-def-ghi.trycloudflare.com
echo.
echo   STEP 3: Share these links:
echo           Admin Panel = https://xxxx.trycloudflare.com/panel/
echo           Student Bot = https://xxxx.trycloudflare.com/widget/
echo.
echo NOTES:
echo   - URL changes every time you restart (that is normal)
echo   - The chatbot must be running for the URL to work
echo   - First reply may take 60-90 seconds (normal for local AI)
echo.
echo ===================================================
echo.
echo Want to test it RIGHT NOW?
echo Press Y to start the Quick Tunnel, or any other key to exit.
echo.
choice /C YN /M "Start tunnel now?"
if %errorlevel% equ 1 (
    echo.
    echo Starting Quick Tunnel...
    echo Your public URL will appear in a moment!
    echo.
    %CF_EXE% tunnel --url http://localhost:8000
)

echo.
pause
