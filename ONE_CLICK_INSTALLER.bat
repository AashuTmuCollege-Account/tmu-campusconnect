@echo off
TITLE TMU CampusConnect — One-Click Universal Installer
color 0B
cd /d "%~dp0"

echo.
echo =====================================================================
echo       TMU CampusConnect — Universal Windows Installer & Doctor
echo       Teerthanker Mahaveer University Intelligent Campus AI
echo =====================================================================
echo.
echo   * Auto-detecting missing tools (Python 3.12, Ollama)
echo   * Verifying local AI models (llama3.2:3b and mxbai-embed-large)
echo   * Loading pre-filled configurations (ngrok domain, secret keys)
echo   * Connecting pre-loaded university knowledge base (13 sources)
echo   * Self-healing dependency conflicts and starting AI services
echo.
echo Starting Installer GUI...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] Installer closed or encountered an issue.
    echo If the graphical window did not open, running in CLI mode...
    echo.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" -CLI
    pause
)
