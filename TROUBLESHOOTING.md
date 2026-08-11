# Troubleshooting & FAQ

### 1. `torch.cuda.is_available()` returns `False`
- **Cause**: PyTorch was installed from standard PyPI without CUDA wheels.
- **Fix**: Run:
  ```powershell
  .\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 --force-reinstall
  ```

### 2. Out of Memory (OOM) on RTX 4060 8GB
- **Solution**:
  1. Set Mode to **Fast** (20 steps) or **Balanced** (30 steps).
  2. The system automatically maintains working resolution at 768x1024 with BF16/FP16 memory management to stay below 4 GB VRAM.
  3. Close heavy 3D software or games using GPU memory before running batch jobs.

### 3. Face / Identity Drift
- **Cause**: Edit mask was too large or face protection was bypassed.
- **Fix**: The integrated `compositor.composite_with_preservation` locks face, hair, and hands with alpha feathering outside the garment region. Ensure you do not disable face protection in settings.

### 4. Long sleeve to Short sleeve arm reconstruction
- **Solution**: Ensure garment type is correctly set to `tops` with target sleeve `short` or `sleeveless`. The `SleeveGeometryEngine` will automatically generate forearms with sampled skin tones and scene lighting.
