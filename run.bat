@echo off
echo =========================================================================
echo    FinGuard AI - Multi-Agent AML Investigation & Risk Platform
echo =========================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FinGuard Backend" cmd /k "cd backend && python -m uvicorn app.main:app --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "FinGuard Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both services launched! 
echo Access the AML Intelligence Dashboard at: http://localhost:5173
echo Access Backend API Documentation at: http://127.0.0.1:8000/docs
echo =========================================================================
pause
