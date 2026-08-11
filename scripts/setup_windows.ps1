Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   AI Virtual Try-On Studio - Windows Setup Installer    " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Create Python virtual environment if not present
if (-not (Test-Path ".venv")) {
    Write-Host "[1/4] Creating Python 3.11 virtual environment..." -ForegroundColor Yellow
    py -3.11 -m venv .venv
} else {
    Write-Host "[1/4] Virtual environment (.venv) already exists." -ForegroundColor Green
}

# 2. Upgrade pip & install PyTorch with CUDA 12.4
Write-Host "[2/4] Installing PyTorch with CUDA 12.4 acceleration..." -ForegroundColor Yellow
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\pip.exe install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# 3. Install AI & web dependencies
Write-Host "[3/4] Installing CV & Web dependencies..." -ForegroundColor Yellow
.\.venv\Scripts\pip.exe install -r requirements.txt httpx

# 4. Install Frontend dependencies
Write-Host "[4/4] Installing React Frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "   Setup complete! Launch with: .\scripts\start_app.bat   " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
