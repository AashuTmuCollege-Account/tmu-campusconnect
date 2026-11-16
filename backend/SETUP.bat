@echo off
TITLE TMU CampusConnect - Setup Script
echo.
echo ============================================
echo  TMU CampusConnect - First Time Setup
echo  Teerthanker Mahaveer University
echo ============================================
echo.

:: Step 1: Check Python 3.12 via the py launcher
py -3.12 --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python 3.12 is not installed or not found by the py launcher.
    echo Please download Python 3.12 from:
    echo   https://www.python.org/downloads/release/python-3128/
    echo During installation, check "Add Python to PATH" and ensure the py launcher is enabled.
    echo NOTE: Python 3.14 is too new - many packages lack pre-built wheels for it.
    pause & exit /b 1
)

for /f "tokens=*" %%V in ('py -3.12 --version') do set PYVER=%%V
echo [OK] Found %PYVER%.

:: Step 2: Create a virtual environment using Python 3.12
echo.
echo [1/5] Creating Python virtual environment (Python 3.12)...
py -3.12 -m venv venv
IF %ERRORLEVEL% NEQ 0 ( echo [ERROR] Could not create venv. & pause & exit /b 1 )
echo [OK] Virtual environment created.

:: Step 3: Install dependencies
echo.
echo [2/5] Installing Python dependencies (this may take a few minutes)...
call venv\Scripts\pip install -r requirements.txt --quiet
IF %ERRORLEVEL% NEQ 0 ( echo [ERROR] pip install failed. & pause & exit /b 1 )
echo [OK] Dependencies installed.

:: Step 4: Copy .env file
echo.
echo [3/5] Setting up configuration...
IF NOT EXIST .env (
    copy .env.example .env
    echo [OK] Created .env file. Please edit it with your settings.
) ELSE (
    echo [OK] .env file already exists.
)

:: Step 5: Create data directories
echo.
echo [4/5] Creating data directories...
mkdir data 2>nul
mkdir data\chromadb 2>nul
echo [OK] Directories created.

:: Step 6: Check Ollama
echo.
echo [5/5] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ollama is not running.
    echo Please install Ollama from https://ollama.com/download/windows
    echo Then run these commands in a new window:
    echo   ollama pull llama3:8b
    echo   ollama pull mxbai-embed-large
) ELSE (
    echo [OK] Ollama is running.
)

echo.
echo ============================================
echo  Setup Complete!
echo  Run START_SERVER.bat to launch TMU CampusConnect.
echo ============================================
echo.
pause
