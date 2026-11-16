@echo off
TITLE TMU CampusConnect — Internet Sharing (ngrok)
color 0B
cd /d "%~dp0"

echo.
echo ===================================================================
echo   TMU CampusConnect — Internet Sharing (ngrok)
echo   Public Domain: https://unstuffed-flyover-answering.ngrok-free.dev
echo ===================================================================
echo.
echo Make sure START_CHATBOT.bat is running first!
echo.

set NGROK_BIN=ngrok
if exist "%~dp0backend\ngrok.exe" set NGROK_BIN="%~dp0backend\ngrok.exe"
if exist "%~dp004 - Optional - Share Over Internet (ngrok)\ngrok.exe" set NGROK_BIN="%~dp004 - Optional - Share Over Internet (ngrok)\ngrok.exe"

%NGROK_BIN% http 8000 --domain=unstuffed-flyover-answering.ngrok-free.dev
pause
