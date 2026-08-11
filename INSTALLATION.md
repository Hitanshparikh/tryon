# Installation & Environment Setup Guide

This guide details setting up the AI Virtual Try-On Studio on Windows 11 / Windows 10 with full NVIDIA CUDA GPU acceleration.

---

## 1. System Requirements

- **Operating System**: Windows 11 (64-bit) or Windows 10 (64-bit)
- **GPU**: NVIDIA GPU with 8+ GB VRAM (RTX 4060 / 4070 / 4080 / 4090 or RTX 3060 12GB)
- **NVIDIA Driver**: Version 550.xx or higher (CUDA 12.x / 13.x supported)
- **Python**: Python 3.11 (64-bit recommended)
- **Node.js**: Node.js 18+ & npm 9+

---

## 2. Automated Installation (Recommended)

Run the automated PowerShell installer:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\scripts\setup_windows.ps1
```

This script will automatically:
1. Create a Python 3.11 virtual environment (`.venv`).
2. Upgrade `pip`.
3. Install PyTorch with CUDA 12.4 binary wheels.
4. Install OpenCV, Rembg, Uvicorn, FastAPI, and Diffusers.
5. Install frontend Node modules in `frontend/`.
6. Verify CUDA availability and VRAM allocation.

---

## 3. Manual Installation

### Backend Setup
```powershell
# Create virtual environment
py -3.11 -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install PyTorch with CUDA 12.4
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Install AI & Web requirements
pip install -r requirements.txt
```

### Frontend Setup
```powershell
cd frontend
npm install
cd ..
```

---

## 4. Starting the Application

Launch both servers with the 1-click launcher:
```powershell
.\scripts\start_app.bat
```

Or run individually:
- **Backend**: `.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload`
- **Frontend**: `cd frontend; npm run dev`
