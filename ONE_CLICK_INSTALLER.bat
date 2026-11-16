@echo off
TITLE TMU CampusConnect — Deployment Hub & Installer
color 0F
cd /d "%~dp0"

echo.
echo =====================================================================
echo       TMU CampusConnect — Universal Deployment Hub
echo       Teerthanker Mahaveer University Intelligent Campus AI
echo =====================================================================
echo.
echo Starting Deployment Hub...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] Running in interactive console mode...
    echo.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" -CLI
    pause
)
