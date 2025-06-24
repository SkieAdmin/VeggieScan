@echo off
echo Starting VeggieScan Frontend with network access...
echo Your local IP address is: 
ipconfig | findstr "IPv4"
echo.
echo Access the application from other devices using your IP address:3000
echo.
set REACT_APP_WDS_SOCKET_PORT=0
npm start
