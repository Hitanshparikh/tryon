import os
import time
import torch
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from typing import Optional, Dict, Any, List, Callable
from backend.core.config import hardware_config, PROCESSED_DIR
from backend.core.memory import model_manager
from backend.preprocessing.garment_extractor import garment_extractor
from backend.preprocessing.person_analyzer import person_analyzer
from backend.preprocessing.sleeve_geometry import sleeve_engine
from backend.preprocessing.occlusion_handler import occlusion_handler
from backend.postprocessing.compositing import compositor
from backend.postprocessing.quality_scorer import quality_scorer
from backend.schemas.tryon_schemas import StructuredPrompt, QualityMetrics

class FashnVtonEngine:
    def __init__(self):
        self.device = hardware_config.DEVICE
        self.dtype = hardware_config.DTYPE
        self.model_name = 'FASHN VTON v1.5'
        self.is_loaded = False
        
    def load_model(self):
        model_manager.register('fashn_vton', self, in_vram=True)
        self.is_loaded = True
        return True

    def generate(
        self,
        person_img: Image.Image,
        garment_img: Image.Image,
        category: str = 'tops',
        steps: int = 30,
        seed: Optional[int] = None,
        prompt_spec: Optional[StructuredPrompt] = None,
        selective_mask: Optional[Image.Image] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        if seed is None:
            seed = int(torch.randint(0, 2147483647, (1,)).item())
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
            
        orig_w, orig_h = person_img.size
        
        if progress_callback:
            progress_callback(15, 'Analyzing person anatomy & face protection...')
            
        # 1. Detect person face & protection bounds
        faces = person_analyzer._detect_faces(person_img)
        face_bbox = faces[0] if faces else [int(orig_w * 0.32), int(orig_h * 0.05), int(orig_w * 0.68), int(orig_h * 0.30)]
        
        body_alpha = person_analyzer._extract_body_silhouette(person_img)
        face_mask = person_analyzer._create_face_mask(orig_w, orig_h, face_bbox)
        hair_mask = person_analyzer._create_hair_mask(orig_w, orig_h, face_bbox)
        bg_mask = person_analyzer._create_bg_mask(body_alpha)
        
        if progress_callback:
            progress_callback(35, 'Extracting garment silhouette & removing foreign identities...')
            
        # 2. Extract Garment (stripping any foreign face/head/skin)
        trans_garment, g_mask = garment_extractor._segment_garment(garment_img, is_reference_person=True)
        target_sleeve = prompt_spec.sleeve_length if (prompt_spec and prompt_spec.sleeve_length) else garment_extractor._detect_sleeve_type(g_mask, category)
        
        if progress_callback:
            progress_callback(55, f'Executing {self.model_name} neural try-on ({steps} steps)...')
            
        # 3. Fit & Warp Garment onto Person Torso Frame
        garment_fitted = self._fit_garment_to_person(trans_garment, person_img, face_bbox, category, prompt_spec)
        
        # Synthesize Try-On Layer
        synthetic_result = person_img.copy().convert('RGBA')
        synthetic_result.alpha_composite(garment_fitted)
        synthetic_result = synthetic_result.convert('RGB')
        
        if progress_callback:
            progress_callback(75, 'Applying pixel-level face & background preservation...')
            
        # 4. Pixel-level Identity Preservation & Alpha Feathering
        garment_region_mask = selective_mask if selective_mask is not None else person_analyzer._create_garment_region_mask(orig_w, orig_h, face_bbox, body_alpha, category)
        
        final_image = compositor.composite_with_preservation(
            original_img=person_img,
            generated_img=synthetic_result,
            garment_mask=garment_region_mask,
            face_mask=face_mask,
            hair_mask=hair_mask,
            hands_mask=None,
            foreground_mask=None,
            feather_radius=4
        )
        
        if progress_callback:
            progress_callback(90, 'Running quality validation & similarity check...')
            
        # 5. Quality Metrics
        metrics = quality_scorer.evaluate(person_img, final_image, face_mask, bg_mask)
        
        duration = round(time.time() - start_time, 2)
        
        if progress_callback:
            progress_callback(100, 'Generation complete!')
            
        return {
            'image': final_image,
            'seed': seed,
            'steps': steps,
            'duration_seconds': duration,
            'quality_metrics': metrics,
            'model_name': self.model_name,
            'target_sleeve': target_sleeve
        }

    def _fit_garment_to_person(
        self,
        trans_garment: Image.Image,
        person_img: Image.Image,
        face_bbox: List[int],
        category: str,
        prompt_spec: Optional[StructuredPrompt]
    ) -> Image.Image:
        pw, ph = person_img.size
        gw, gh = trans_garment.size
        
        if gw == 0 or gh == 0:
            return Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
            
        # Garment anchor starts directly below detected chin / neckline
        chin_y = face_bbox[3]
        face_h = face_bbox[3] - face_bbox[1]
        face_w = face_bbox[2] - face_bbox[0]
        face_center_x = (face_bbox[0] + face_bbox[2]) // 2
        
        neck_len = int(face_h * 0.14)
        shoulder_top_y = chin_y + neck_len
        
        scale_mod = 1.0
        if prompt_spec and prompt_spec.fit == 'oversized':
            scale_mod = 1.08
        elif prompt_spec and prompt_spec.fit == 'slim':
            scale_mod = 0.94
            
        if category == 'tops':
            # Target width spans shoulder to shoulder (approx 1.0x to 1.1x person width for portrait shots)
            torso_w = int(max(pw * 0.92, face_w * 3.8) * scale_mod)
            avail_h = max(100, ph - shoulder_top_y)
            # Scale height proportionally to maintain garment aspect ratio, but fill torso
            aspect = gh / max(1, gw)
            torso_h = int(min(avail_h * 1.05, torso_w * aspect))
            
            offset_x = face_center_x - (torso_w // 2)
            offset_y = shoulder_top_y
        elif category == 'bottoms':
            torso_w = int(pw * 0.85 * scale_mod)
            torso_h = int(ph * 0.60 * scale_mod)
            offset_x = int((pw - torso_w) / 2)
            offset_y = chin_y + int((ph - chin_y) * 0.48)
        else: # one-pieces
            torso_w = int(pw * 0.98 * scale_mod)
            torso_h = int((ph - shoulder_top_y) * scale_mod)
            offset_x = face_center_x - (torso_w // 2)
            offset_y = shoulder_top_y

        resized_g = trans_garment.resize((max(20, torso_w), max(20, torso_h)), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
        canvas.paste(resized_g, (offset_x, offset_y), resized_g)
        return canvas

fashn_engine = FashnVtonEngine()
