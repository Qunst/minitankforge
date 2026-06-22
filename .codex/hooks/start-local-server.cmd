@echo off
set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" scripts\start-local-server.mjs --check-only
if %ERRORLEVEL% EQU 0 exit /b 0
start "" /min "%NODE%" scripts\local-static-server.mjs
