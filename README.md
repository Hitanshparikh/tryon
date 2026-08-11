# AI Virtual Try-On Studio (FASHN VTON v1.5)

A production-grade, photorealistic AI virtual try-on and clothing replacement SaaS application engineered for **NVIDIA RTX 4060 (8 GB VRAM)**, running 100% locally with unlimited inference capabilities.

---

## Key Highlights

- **Genuine Garment Replacement**: Understands cloth geometry rather than superficial recoloring or texture mapping. Supports tops (shirts, tees, hoodies, jackets), bottoms (jeans, trousers, skirts), and one-pieces (dresses).
- **Intelligent Sleeve & Arm Reconstruction**: Automatically detects long-sleeve to short-sleeve deltas, synthesizing natural forearms with matching skin tone and scene lighting.
- **Pixel-Perfect Identity Preservation**: 100% preservation of face, hairstyle, hands, background, jewelry, and accessories outside the target edit region.
- **Occlusion-Aware**: Understands foreground crossed arms, hands in pockets, and necklaces over garments.
- **SaaS-Ready Studio Interface**: React + TypeScript + Tailwind CSS with draggable split-slider, side-by-side comparison, high-res zoom/pan, and saved wardrobe management.
- **Modular Hardware Optimization**: Runs in FP16/BF16 on RTX 4060 8GB under 5-15s per generation with zero external paid APIs required.

---

## Quick Start (1-Click)

### Prerequisites
- Windows 11 / Windows 10
- NVIDIA GPU with 8+ GB VRAM (e.g. RTX 4060)
- Python 3.11 & Node.js 18+

### Setup & Launch
```powershell
# 1. Run automated Windows setup
.\scripts\setup_windows.ps1

# 2. Launch 1-click Studio launcher
.\scripts\start_app.bat
```

Open `http://localhost:5173` in your browser to access the studio.

---

## Documentation
- [Architecture Details](ARCHITECTURE.md)
- [Installation Guide](INSTALLATION.md)
- [Model Licenses](MODEL_LICENSES.md)
- [API Reference](API.md)
- [Performance & Benchmarks](PERFORMANCE.md)
- [Troubleshooting](TROUBLESHOOTING.md)
