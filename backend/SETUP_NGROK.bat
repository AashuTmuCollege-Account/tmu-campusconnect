@echo off
TITLE TMU Chatbot - ngrok Permanent URL Setup
color 0B
cd /d %~dp0

echo.
echo ===================================================
echo  TMU Chatbot - Permanent URL Setup (ngrok FREE)
echo ===================================================
echo.
echo This gives you a PERMANENT free URL that never changes!
echo Example: https://your-name-abc.ngrok-free.app
echo.
echo BEFORE YOU START:
echo   1. Go to https://ngrok.com and sign up FREE
echo   2. After login, go to: Cloud Edge then Domains
echo   3. Click New Domain to get your free static domain
echo   4. Go to Your Authtoken and copy your token
echo.
echo Press any key when you have done the above steps...
pause >nul

:: ── Step 1: Install ngrok ─────────────────────────────────────────────────────
echo.
echo [Step 1 of 4] Installing ngrok...
echo.

if exist "%~dp0ngrok.exe" (
    echo ngrok already installed locally. OK
    goto :auth
)
where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    echo ngrok already installed globally. OK
    goto :auth
)

winget install --id Ngrok.Ngrok --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
if %errorlevel% equ 0 (
    echo ngrok installed via winget. OK
    goto :find_ngrok
)

:: Try chocolatey
where choco >nul 2>&1
if %errorlevel% equ 0 (
    choco install ngrok -y >nul 2>&1
    echo ngrok installed via chocolatey. OK
    goto :find_ngrok
)

:: Manual download
echo.
echo Automatic install failed. Opening download page...
echo.
echo MANUAL STEPS:
echo   1. Download ngrok from the page that opens
echo   2. Extract ngrok.exe from the zip file
echo   3. Move ngrok.exe to this folder:
echo      %~dp0
echo   4. Come back here and press any key
echo.
start "" "https://ngrok.com/download"
pause >nul

:find_ngrok
:: Refresh path - check common ngrok locations
if exist "%~dp0ngrok.exe" goto :auth
where ngrok >nul 2>&1
if %errorlevel% equ 0 goto :auth

for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok*") do (
    if exist "%%D\ngrok.exe" (
        copy /y "%%D\ngrok.exe" "%~dp0ngrok.exe" >nul 2>&1
        goto :auth
    )
)

echo.
echo ngrok installed but not found in path or local folder yet.
echo EASY FIX: Close this window and run SETUP_NGROK.bat again.
echo.
pause
exit /b 1

:: ── Step 2: Enter Auth Token ──────────────────────────────────────────────────
:auth
echo.
echo [Step 2 of 4] Connecting your ngrok account...
echo.
echo Go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo Copy your authtoken (looks like: 2abc...xyz_something)
echo.
set /p NGROK_TOKEN="Paste your ngrok authtoken here and press Enter: "

if "%NGROK_TOKEN%"=="" (
    echo You must enter your authtoken. Try again.
    goto :auth
)

if exist "%~dp0ngrok.exe" (
    "%~dp0ngrok.exe" config add-authtoken %NGROK_TOKEN%
) else (
    ngrok config add-authtoken %NGROK_TOKEN%
)
echo.
echo Authtoken saved. OK

:: ── Step 3: Enter Static Domain ───────────────────────────────────────────────
echo.
echo [Step 3 of 4] Setting your permanent domain...
echo.
echo Go to: https://dashboard.ngrok.com/cloud-edge/domains
echo Copy your free static domain (looks like: abc-xyz-123.ngrok-free.app)
echo.
set /p NGROK_DOMAIN="Paste your ngrok static domain here and press Enter: "

if "%NGROK_DOMAIN%"=="" (
    echo You must enter your domain. Try again.
    goto :step3retry
)
goto :createfiles

:step3retry
set /p NGROK_DOMAIN="Paste your ngrok static domain: "
if "%NGROK_DOMAIN%"=="" (
    echo Using temporary URL mode (no static domain).
    set NGROK_DOMAIN=NONE
)

:: ── Step 4: Create startup files ──────────────────────────────────────────────
:createfiles
echo.
echo [Step 4 of 4] Creating your startup files...
echo.

:: Save domain to config file
echo %NGROK_DOMAIN% > "%~dp0ngrok_domain.txt"
echo %NGROK_TOKEN%  >> "%~dp0ngrok_domain.txt"

:: Create START_NGROK.bat
if exist "%~dp0ngrok.exe" (
    if "%NGROK_DOMAIN%"=="NONE" (
        set NGROK_CMD="%%~dp0ngrok.exe" http 8000
    ) else (
        set NGROK_CMD="%%~dp0ngrok.exe" http 8000 --domain=%NGROK_DOMAIN%
    )
    set URL_TYPE=PERMANENT: https://%NGROK_DOMAIN%
) else (
    if "%NGROK_DOMAIN%"=="NONE" (
        set NGROK_CMD=ngrok http 8000
    ) else (
        set NGROK_CMD=ngrok http 8000 --domain=%NGROK_DOMAIN%
    )
    set URL_TYPE=PERMANENT: https://%NGROK_DOMAIN%
)

(
echo @echo off
echo TITLE TMU Chatbot - Permanent Internet Access
echo color 0A
echo cd /d %%~dp0
echo.
echo echo.
echo echo ===================================================
echo echo  TMU Chatbot - Starting Internet Access...
echo echo ===================================================
echo echo.
echo echo Your PERMANENT public URL:
echo echo   https://%NGROK_DOMAIN%
echo echo.
echo echo Share these links with ANYONE in the world:
echo echo   Admin Panel: https://%NGROK_DOMAIN%/panel/
echo echo   Chat Widget: https://%NGROK_DOMAIN%/widget/
echo echo.
echo echo This URL NEVER changes. Same URL every time!
echo echo ===================================================
echo echo.
echo echo Starting tunnel... (browser dashboard opens at http://localhost:4040)
echo echo.
echo set NGROK_BIN=ngrok
echo if exist "%%~dp0ngrok.exe" set NGROK_BIN="%%~dp0ngrok.exe"
if "%NGROK_DOMAIN%"=="NONE" (
    echo %%NGROK_BIN%% http 8000
) else (
    echo %%NGROK_BIN%% http 8000 --domain=%NGROK_DOMAIN%
)
echo pause
) > "%~dp0START_NGROK.bat"

echo Created START_NGROK.bat OK

:: Update START_SERVER.bat to use ngrok
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
echo curl -s http://localhost:11434/api/tags ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo Ollama not running. Starting now...
echo     start "" ollama serve
echo     ping 127.0.0.1 -n 16 ^>nul
echo ^)
echo echo Ollama running. OK
echo echo.
echo.
echo echo [Step 2 of 3] Starting Chatbot Server...
echo start "UniBot Server" cmd /k "cd /d %%~dp0 ^&^& call venv\Scripts\activate ^&^& python -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo ping 127.0.0.1 -n 13 ^>nul
echo echo Chatbot server started. OK
echo echo.
echo.
echo echo [Step 3 of 3] Starting Internet Access ^(ngrok^)...
echo set NGROK_BIN=ngrok
echo if exist "%%~dp0ngrok.exe" set NGROK_BIN="%%~dp0ngrok.exe"
echo if exist "%%~dp0ngrok.exe" ^(
echo     set NGROK_FOUND=1
echo ^) else ^(
echo     where ngrok ^>nul 2^>^&1
echo     if %%errorlevel%% equ 0 ^(
echo         set NGROK_FOUND=1
echo     ^) else ^(
echo         set NGROK_FOUND=0
echo     ^)
echo ^)
echo if %%NGROK_FOUND%% equ 1 ^(
if "%NGROK_DOMAIN%"=="NONE" (
    echo     start "ngrok Tunnel" cmd /k "%%NGROK_BIN%% http 8000"
) else (
    echo     start "ngrok Tunnel" cmd /k "%%NGROK_BIN%% http 8000 --domain=%NGROK_DOMAIN%"
)
echo     ping 127.0.0.1 -n 6 ^>nul
echo     echo ngrok started. OK
echo ^) else ^(
echo     echo ngrok not found. Run SETUP_NGROK.bat to enable internet access.
echo ^)
echo.
echo echo.
echo echo ===================================================
echo echo  ALL DONE - TMU Chatbot is running!
echo echo.
echo echo  LOCAL ^(this PC only^):
echo echo    Admin Panel = http://localhost:8000/panel/
echo echo    Chat Widget = http://localhost:8000/widget/
echo echo.
echo echo  INTERNET ^(from anywhere in the world^):
echo echo    Admin Panel = https://%NGROK_DOMAIN%/panel/
echo echo    Chat Widget = https://%NGROK_DOMAIN%/widget/
echo echo.
echo echo  This URL is PERMANENT - share it freely!
echo echo  Login: admin / admin123
echo echo  IMPORTANT: Change password after first login!
echo echo.
echo echo  Do NOT close this window.
echo echo ===================================================
echo echo.
echo echo Press any key to open the Admin Panel...
echo pause ^>nul
echo start "" http://localhost:8000/panel/
) > "%~dp0START_SERVER.bat"

echo Updated START_SERVER.bat with permanent URL. OK

:: Update embed.js with permanent URL
if not "%NGROK_DOMAIN%"=="NONE" (
    powershell -Command "(Get-Content '..\widget\embed.js') -replace 'http://localhost:8000', 'https://%NGROK_DOMAIN%' | Set-Content '..\widget\embed.js'" >nul 2>&1
    echo Updated widget embed URL to permanent URL. OK
)

:: ── Done ──────────────────────────────────────────────────────────────────────
echo.
echo ===================================================
echo  SETUP COMPLETE!
echo ===================================================
echo.
if not "%NGROK_DOMAIN%"=="NONE" (
    echo  Your PERMANENT chatbot URL:
    echo.
    echo   Admin Panel = https://%NGROK_DOMAIN%/panel/
    echo   Chat Widget = https://%NGROK_DOMAIN%/widget/
    echo.
    echo  This URL never changes! Save it and share freely.
) else (
    echo  Note: No static domain entered.
    echo  You can get one free at: https://dashboard.ngrok.com/cloud-edge/domains
)
echo.
echo  FROM NOW ON: Just double-click START_SERVER.bat
echo  It starts everything automatically including the tunnel.
echo.
echo ===================================================
echo.
if exist "%~dp0ngrok.exe" (
    "%~dp0ngrok.exe" http 8000 --domain=%NGROK_DOMAIN%
) else (
    ngrok http 8000 --domain=%NGROK_DOMAIN%
)

pause
