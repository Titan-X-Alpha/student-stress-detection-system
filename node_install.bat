@echo off
echo Downloading Node.js LTS...
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.11.1/node-v22.11.1-x64.msi' -OutFile 'node.msi'"
echo Installing Node.js silently...
Start /wait msiexec /i node.msi /quiet /norestart
del node.msi
echo Installed! Restart terminal and run run.bat
pause
