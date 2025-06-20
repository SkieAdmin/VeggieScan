@echo off
echo ========================================
echo Starting VeggieScan Backend
echo ========================================
echo.

cd backend
echo Starting FastAPI server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

python main.py
