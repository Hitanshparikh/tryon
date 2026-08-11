import os
import torch
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
GARMENTS_DIR = DATA_DIR / "garments"
PROCESSED_DIR = DATA_DIR / "processed"
OUTPUTS_DIR = DATA_DIR / "outputs"
CACHE_DIR = DATA_DIR / "cache"
MODELS_DIR = BASE_DIR / "models"
DB_PATH = DATA_DIR / "tryon.db"

for d in [DATA_DIR, UPLOADS_DIR, GARMENTS_DIR, PROCESSED_DIR, OUTPUTS_DIR, CACHE_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class HardwareConfig:
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    DTYPE = torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else (torch.float16 if torch.cuda.is_available() else torch.float32)
    ALLOW_TF32 = True
    MAX_VRAM_GB = 8.0  # Optimized for RTX 4060 8GB
    DEFAULT_INFERENCE_STEPS = 30
    FAST_STEPS = 20
    BALANCED_STEPS = 30
    QUALITY_STEPS = 45
    DEFAULT_WIDTH = 768
    DEFAULT_HEIGHT = 1024
    MAX_RESOLUTION = (1536, 2048)

class QualityThresholds:
    MIN_FACE_SIMILARITY = 0.85
    MIN_PRESERVATION_SCORE = 0.80
    AUTO_RETRY_MAX = 2

hardware_config = HardwareConfig()
