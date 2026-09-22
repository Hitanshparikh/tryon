@echo off
title AI Virtual Try-On Studio (FASHN VTON v1.5)
cd /d "%~dp0"
echo =========================================================
echo    Launching AI Virtual Try-On Studio (RTX 4060)
echo =========================================================

echo Starting FastAPI backend server on http://127.0.0.1:8000...
start "AI Try-On Backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir backend"

echo Starting React Vite studio on http://localhost:5173...
start "AI Try-On Frontend" cmd /k "cd frontend && npm run dev"

echo App is launching in your default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173
