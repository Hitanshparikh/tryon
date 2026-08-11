import os
import time
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Optional, Callable
from backend.core.config import PROCESSED_DIR, OUTPUTS_DIR
from backend.inference.fashn_engine import fashn_engine
from backend.schemas.tryon_schemas import StructuredPrompt

class VideoTryOnPipeline:
    def __init__(self):
        self.fps = 30
        self.temporal_smooth_window = 3

    def process_video_frames(
        self,
        frame_paths: List[str],
        garment_img: Image.Image,
        category: str = "tops",
        prompt_spec: Optional[StructuredPrompt] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> List[str]:
        output_frame_paths = []
        total_frames = len(frame_paths)
        seed = 42

        for i, f_path in enumerate(frame_paths):
            if progress_callback:
                pct = int((i / max(1, total_frames)) * 100)
                progress_callback(pct, f"Processing video frame {i+1}/{total_frames} with temporal tracking...")
                
            frame_img = Image.open(f_path).convert("RGB")
            
            # Execute consistent seed frame synthesis
            res = fashn_engine.generate(
                person_img=frame_img,
                garment_img=garment_img,
                category=category,
                steps=20,
                seed=seed,
                prompt_spec=prompt_spec
            )
            
            out_p = PROCESSED_DIR / f"vid_frame_{i:05d}.png"
            res["image"].save(out_p, "PNG")
            output_frame_paths.append(str(out_p))

        return output_frame_paths

video_tryon_pipeline = VideoTryOnPipeline()
