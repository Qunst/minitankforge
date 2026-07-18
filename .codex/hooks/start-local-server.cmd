@echo off
cd /d "%~dp0\..\.."
node scripts\start-local-server.mjs
exit /b %ERRORLEVEL%
