@echo off
REM Run Kira from any directory if this file is in your PATH
cd /d "%~dp0"
node src\index.js %*
