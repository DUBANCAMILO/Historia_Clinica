@echo off
setlocal
cd /d "%~dp0"
echo === NefroHC: preparando instalador de Windows ===
call npm install
if errorlevel 1 goto :error
call npm run tauri:build
if errorlevel 1 goto :error
echo.
echo Instalador creado en:
echo src-tauri\target\release\bundle\nsis\
pause
exit /b 0
:error
echo.
echo No se pudo crear el instalador. Revisa el mensaje anterior.
pause
exit /b 1
