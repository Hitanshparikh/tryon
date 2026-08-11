import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from typing import Dict, Any, Tuple

class SleeveGeometryEngine:
    @staticmethod
    def compute_sleeve_delta(source_sleeve: str, target_sleeve: str, person_w: int, person_h: int) -> Dict[str, Any]:
        is_long_to_short = (source_sleeve == 'long' and target_sleeve in ['short', 'sleeveless'])
        is_short_to_long = (source_sleeve in ['short', 'sleeveless'] and target_sleeve == 'long')
        
        arm_reconstruction_mask = Image.new('L', (person_w, person_h), 0)
        draw = ImageDraw.Draw(arm_reconstruction_mask)
        
        if is_long_to_short:
            # Forearms zone (between mid-bicep and wrist)
            # Left forearm
            draw.polygon([
                (int(person_w * 0.12), int(person_h * 0.45)),
                (int(person_w * 0.25), int(person_h * 0.45)),
                (int(person_w * 0.22), int(person_h * 0.70)),
                (int(person_w * 0.10), int(person_h * 0.70))
            ], fill=255)
            # Right forearm
            draw.polygon([
                (int(person_w * 0.75), int(person_h * 0.45)),
                (int(person_w * 0.88), int(person_h * 0.45)),
                (int(person_w * 0.90), int(person_h * 0.70)),
                (int(person_w * 0.78), int(person_h * 0.70))
            ], fill=255)
            arm_reconstruction_mask = arm_reconstruction_mask.filter(ImageFilter.GaussianBlur(radius=8))
            
        return {
            'is_long_to_short': is_long_to_short,
            'is_short_to_long': is_short_to_long,
            'requires_skin_synthesis': is_long_to_short,
            'arm_reconstruction_mask': arm_reconstruction_mask
        }

sleeve_engine = SleeveGeometryEngine()
