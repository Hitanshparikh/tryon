import sys
import time
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import psutil
import torch
from PIL import Image, ImageDraw
from backend.inference.fashn_engine import fashn_engine
from backend.preprocessing.prompt_interpreter import prompt_interpreter
from backend.core.memory import model_manager

def run_benchmark():
    print("=" * 60)
    print("  AI VIRTUAL TRY-ON STUDIO - HARDWARE PERFORMANCE BENCHMARK")
    print("=" * 60)
    device_info = model_manager.memory_usage()
    print("Device:", device_info.get("device_name", "CPU"))
    print("CUDA Available:", device_info.get("cuda_available", False))
    print("Initial VRAM Allocated:", device_info.get("vram_allocated_gb", 0.0), "GB")
    print("-" * 60)
    w, h = 768, 1024
    person_img = Image.new("RGB", (w, h), (230, 230, 230))
    p_draw = ImageDraw.Draw(person_img)
    p_draw.ellipse([int(w*0.35), int(h*0.08), int(w*0.65), int(h*0.25)], fill=(230, 190, 160))
    p_draw.rectangle([int(w*0.20), int(h*0.25), int(w*0.80), int(h*0.75)], fill=(40, 50, 120))
    garment_img = Image.new("RGB", (w, h), (255, 255, 255))
    g_draw = ImageDraw.Draw(garment_img)
    g_draw.rectangle([int(w*0.25), int(h*0.20), int(w*0.75), int(h*0.60)], fill=(20, 20, 20))
    prompt_spec = prompt_interpreter.parse("Make the shirt short sleeve oversized")
    start_time = time.time()
    res = fashn_engine.generate(
        person_img=person_img,
        garment_img=garment_img,
        category="tops",
        steps=30,
        seed=1001,
        prompt_spec=prompt_spec
    )
    total_time = time.time() - start_time
    vram_peak = torch.cuda.max_memory_allocated() / (1024 ** 3) if torch.cuda.is_available() else 0.0
    ram_peak = psutil.Process().memory_info().rss / (1024 ** 3)
    print("Resolution:", f"{w}x{h}")
    print("Steps:", res.get("steps", 30))
    print("Seed:", res.get("seed", 1001))
    print(f"Total Execution Time: {total_time:.2f} s")
    print(f"Peak VRAM Usage: {vram_peak:.2f} GB")
    print(f"Peak System RAM: {ram_peak:.2f} GB")
    print("Quality Confidence:", f"{res['quality_metrics'].overall_confidence * 100:.1f}%")
    print("Identity Score:", f"{res['quality_metrics'].identity_score * 100:.1f}%")
    print("=" * 60)

if __name__ == "__main__":
    run_benchmark()
