@echo off
echo ========================================
echo VeggieScan System Setup
echo ========================================
echo.

echo Setting up Backend...
cd backend
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Setting up Frontend...
cd ..\frontend
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the system:
echo 1. Start LM Studio at http://26.165.143.148:1234
echo 2. Run backend: cd backend ^&^& python main.py
echo 3. Run frontend: cd frontend ^&^& npx react-native run-android
echo.
echo Check the README files for detailed instructions.
echo.
pause
