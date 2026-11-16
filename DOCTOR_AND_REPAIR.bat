@echo off
TITLE TMU CampusConnect — Doctor & Self-Repair
color 0E
cd /d "%~dp0"

powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0installer.ps1" -RepairOnly
pause
