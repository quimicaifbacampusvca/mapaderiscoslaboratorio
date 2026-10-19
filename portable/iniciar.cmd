@echo off
setlocal
cd /d "%~dp0.."
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0servidor.py"
  goto fim
)
where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0servidor.py"
  goto fim
)
echo Python nao encontrado. Iniciando servidor local com PowerShell do Windows...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor-windows.ps1"
:fim
if errorlevel 1 (
  echo Nao foi possivel iniciar o servidor. Consulte LEIA-ME-OFFLINE.md.
  pause
)
