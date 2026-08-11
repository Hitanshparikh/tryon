import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from typing import Dict, Any, Tuple

class OcclusionHandler:
    @staticmethod
    def detect_occlusions(person_img: Image.Image, garment_mask: Image.Image) -> Dict[str, Any]:
        w, h = person_img.size
        # Hand / forearm foreground mask
        foreground_hands_mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(foreground_hands_mask)
        
        # Central-lower torso area where crossed arms occur
        # If contrast or edge intensity is high across central torso, detect crossed hands
        arr = np.array(person_img.convert('L'))
        torso_region = arr[int(h*0.35):int(h*0.65), int(w*0.25):int(w*0.75)]
        
        # Check standard deviation / edge energy in torso zone
        has_crossed_arms = float(np.std(torso_region)) > 48.0
        
        if has_crossed_arms:
            draw.rectangle([int(w * 0.30), int(h * 0.45), int(w * 0.70), int(h * 0.60)], fill=255)
            foreground_hands_mask = foreground_hands_mask.filter(ImageFilter.GaussianBlur(radius=3))
            
        return {
            'has_crossed_arms': has_crossed_arms,
            'foreground_mask': foreground_hands_mask
        }

occlusion_handler = OcclusionHandler()
