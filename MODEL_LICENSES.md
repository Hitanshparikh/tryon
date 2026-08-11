# Model & Code Licenses Reference

This document tracks all open-source models, CV pipelines, and frameworks integrated into the AI Virtual Try-On Studio.

---

## 1. Primary Virtual Try-On Engine

### **FASHN VTON v1.5**
- **Repository**: [fashn-AI/fashn-vton-1.5](https://github.com/fashn-AI/fashn-vton-1.5)
- **Model Weights**: [fashn-ai/fashn-vton-1.5](https://huggingface.co/fashn-ai/fashn-vton-1.5)
- **License**: **Apache 2.0 (Permissive / Commercial Use Allowed)**
- **Architecture**: Maskless pixel-space conditional diffusion.
- **Hardware Target**: Optimized for NVIDIA RTX 4060 (8 GB VRAM) with FP16/BF16 memory management.

---

## 2. Computer Vision & Segmentation Preprocessing

### **U2Net / BiRefNet / Rembg**
- **License**: **MIT License / Apache 2.0**
- **Purpose**: High-fidelity garment background removal, ghost mannequin transparency matting, silhouette extraction.

### **OpenCV & Haar Cascade Face Detector**
- **License**: **Apache 2.0**
- **Purpose**: Real-time multi-person face localization and anatomical bounding box identification.

---

## 3. Fallback & Alternative Engines

### **CatVTON (Optional Fallback)**
- **License**: **CC BY-NC-SA 4.0 (Non-Commercial Only)**
- **Status**: Kept strictly separate as an optional non-commercial research engine. Never bundled into the default commercial production path.
