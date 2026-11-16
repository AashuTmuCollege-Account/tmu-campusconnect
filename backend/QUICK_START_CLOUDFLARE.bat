@echo off
TITLE TMU Chatbot - Internet Access (Cloudflare Tunnel)
color 0A
cd /d %~dp0

echo.
echo ===================================================
echo  TMU Chatbot - Starting Internet Access...
echo ===================================================
echo.
echo First making sure the chatbot server is running...
cloudflared --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: cloudflared not found. Run SETUP_CLOUDFLARE.bat first.
    pause
    exit /b 1
)

echo Starting Cloudflare Quick Tunnel...
echo.
echo ===================================================
echo  YOUR PUBLIC URL WILL APPEAR BELOW IN 5 SECONDS
echo.
echo  It will look like:
echo  https://xxxx-xxxx-xxxx.trycloudflare.com
echo.
echo  SHARE THESE LINKS WITH ANYONE:
echo  Admin Panel: https://xxxx.trycloudflare.com/panel/
echo  Chat Widget: https://xxxx.trycloudflare.com/widget/
echo.
echo  NOTE: The URL changes every time you restart.
echo  Copy it fresh each time you start the tunnel.
echo ===================================================
echo.
cloudflared tunnel --url http://localhost:8000

pause
