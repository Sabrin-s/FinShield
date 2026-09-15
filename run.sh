#!/bin/bash
echo "========================================================================="
echo "   FinGuard AI - Multi-Agent AML Investigation & Risk Platform"
echo "========================================================================="

echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
(cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

echo "[2/2] Starting React Vite Frontend on http://localhost:5173 ..."
(cd frontend && npm install && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "Both services running. Press CTRL+C to stop."
wait
