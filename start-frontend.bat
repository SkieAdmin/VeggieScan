@echo off
echo ========================================
echo Starting VeggieScan Mobile App
echo ========================================
echo.

cd frontend
echo Starting React Native Metro bundler...
echo.
echo Make sure you have:
echo 1. Android Studio installed and configured
echo 2. Android device connected or emulator running
echo 3. Backend server running at http://localhost:8000
echo.

start "Metro Bundler" cmd /k "npx react-native start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Android app...
npx react-native run-android
