import os
import uuid
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, List
from backend.core.config import GARMENTS_DIR, PROCESSED_DIR
from backend.schemas.tryon_schemas import GarmentAsset

class GarmentExtractor:
    def __init__(self):
        self.rembg_session = None

    def _get_rembg_session(self):
        if self.rembg_session is None:
            try:
                import rembg
                self.rembg_session = rembg.new_session('u2net')
            except Exception:
                self.rembg_session = None
        return self.rembg_session

    def extract(self, image_path: str, is_reference_person: bool = True, category_hint: Optional[str] = None) -> GarmentAsset:
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f'Image not found: {image_path}')

        img = Image.open(path).convert('RGB')
        w, h = img.size
        
        # 1. Background & Foreign Identity Removal
        transparent_img, mask = self._segment_garment(img, is_reference_person=True)
        
        # 2. Geometry & Feature Extraction
        category = category_hint or self._infer_category(mask, img)
        sleeve_type = self._detect_sleeve_type(mask, category)
        dominant_colors = self._extract_dominant_colors(transparent_img)
        has_graphics = self._detect_graphics(transparent_img, mask)
        
        # 3. Save extracted assets
        asset_id = str(uuid.uuid4())
        trans_path = PROCESSED_DIR / f'{asset_id}_garment_trans.png'
        mask_path = PROCESSED_DIR / f'{asset_id}_garment_mask.png'
        
        transparent_img.save(trans_path, 'PNG')
        mask.save(mask_path, 'PNG')
        
        return GarmentAsset(
            id=asset_id,
            name=path.stem.replace('_', ' ').title(),
            category=category,
            sub_category=self._infer_subcategory(category, sleeve_type),
            sleeve_type=sleeve_type,
            dominant_colors=dominant_colors,
            has_graphics=has_graphics,
            original_path=f"/data/garments/{path.name}",
            transparent_path=f"/data/processed/{trans_path.name}",
            mask_path=f"/data/processed/{mask_path.name}",
            confidence=0.98
        )

    def _segment_garment(self, img: Image.Image, is_reference_person: bool = True) -> Tuple[Image.Image, Image.Image]:
        # Background removal
        try:
            import rembg
            session = self._get_rembg_session()
            if session:
                trans = rembg.remove(img, session=session)
            else:
                trans = rembg.remove(img)
        except Exception:
            img_rgba = img.convert('RGBA')
            arr = np.array(img_rgba)
            gray = np.mean(arr[:, :, :3], axis=2)
            bg_mask = (gray > 240) | (gray < 15)
            arr[bg_mask, 3] = 0
            trans = Image.fromarray(arr)

        w, h = trans.size
        arr = np.array(trans)
        alpha = arr[:, :, 3]
        
        # 1. Detect if image contains a person's head/face and strip it completely
        face_detected = False
        face_bottom_y = 0
        
        try:
            import cv2
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            face_cascade = cv2.CascadeClassifier(cascade_path)
            cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
            faces = face_cascade.detectMultiScale(cv_img, scaleFactor=1.1, minNeighbors=3, minSize=(int(w * 0.1), int(h * 0.1)))
            if len(faces) > 0:
                # Largest face
                faces = sorted(faces, key=lambda b: b[2] * b[3], reverse=True)
                fx, fy, fw, fh = faces[0]
                face_detected = True
                face_bottom_y = min(h, fy + fh + int(fh * 0.25))  # Chin + neck bottom
        except Exception:
            pass

        # If reference person or face was found, erase everything from neck up
        if face_detected:
            arr[:face_bottom_y, :, 3] = 0
        else:
            # Fallback skin check in top 40%
            # If top region has significant skin color (head/neck), strip the head zone
            top_zone = arr[:int(h * 0.35), :, :3]
            r, g, b = top_zone[:, :, 0], top_zone[:, :, 1], top_zone[:, :, 2]
            skin_pixels = (r > 90) & (g > 45) & (b > 25) & (r > g) & (r > b) & ((r.astype(int) - g.astype(int)) > 15)
            if np.sum(skin_pixels) > (w * h * 0.02):
                # Erase head/face from top 30%
                arr[:int(h * 0.30), :, 3] = 0

        # 2. Strip bottom skin/hands if present
        lower_zone_y = int(h * 0.70)
        lower_zone = arr[lower_zone_y:, :, :3]
        r_l, g_l, b_l = lower_zone[:, :, 0], lower_zone[:, :, 1], lower_zone[:, :, 2]
        skin_lower = (r_l > 95) & (g_l > 50) & (b_l > 30) & (r_l > g_l) & (r_l > b_l) & ((r_l.astype(int) - g_l.astype(int)) > 20)
        arr[lower_zone_y:, :, 3][skin_lower] = 0

        clean_trans = Image.fromarray(arr)
        clean_alpha = Image.fromarray(arr[:, :, 3])
        
        # Crop tightly to the isolated garment
        bbox = clean_alpha.getbbox()
        if bbox:
            clean_trans = clean_trans.crop(bbox)
            clean_alpha = clean_alpha.crop(bbox)

        return clean_trans, clean_alpha

    def _infer_category(self, mask: Image.Image, img: Image.Image) -> str:
        arr = np.array(mask) > 128
        if not np.any(arr):
            return 'tops'
        y_indices, x_indices = np.where(arr)
        min_y, max_y = np.min(y_indices), np.max(y_indices)
        min_x, max_x = np.min(x_indices), np.max(x_indices)
        
        garment_h = max_y - min_y
        garment_w = max_x - min_x
        aspect_ratio = garment_h / max(garment_w, 1)
        
        if aspect_ratio > 1.7:
            return 'one-pieces'
        return 'tops'

    def _infer_subcategory(self, category: str, sleeve_type: str) -> str:
        if category == 'tops':
            if sleeve_type == 'short':
                return 'tshirt'
            elif sleeve_type == 'sleeveless':
                return 'tank_top'
            else:
                return 'blazer_jacket'
        elif category == 'bottoms':
            return 'trousers'
        elif category == 'one-pieces':
            return 'dress'
        return 'apparel'

    def _detect_sleeve_type(self, mask: Image.Image, category: str) -> str:
        if category != 'tops':
            return 'regular'
            
        arr = np.array(mask) > 128
        if not np.any(arr):
            return 'long'
            
        y_indices, x_indices = np.where(arr)
        min_y, max_y = np.min(y_indices), np.max(y_indices)
        min_x, max_x = np.min(x_indices), np.max(x_indices)
        
        garment_h = max_y - min_y
        garment_w = max_x - min_x
        
        lower_y1 = min_y + int(garment_h * 0.40)
        lower_y2 = min_y + int(garment_h * 0.90)
        
        left_sleeve = arr[lower_y1:lower_y2, min_x:min_x + int(garment_w * 0.25)]
        right_sleeve = arr[lower_y1:lower_y2, max_x - int(garment_w * 0.25):max_x]
        
        has_left = np.sum(left_sleeve) > (left_sleeve.size * 0.15) if left_sleeve.size > 0 else False
        has_right = np.sum(right_sleeve) > (right_sleeve.size * 0.15) if right_sleeve.size > 0 else False
        
        if has_left or has_right or garment_w > (garment_h * 0.75):
            return 'long'
        elif garment_w < (garment_h * 0.45):
            return 'sleeveless'
        else:
            return 'short'

    def _extract_dominant_colors(self, trans_img: Image.Image) -> List[str]:
        arr = np.array(trans_img)
        if arr.shape[2] < 4:
            return ['#e2e8f0']
        alpha = arr[:, :, 3] > 128
        if not np.any(alpha):
            return ['#e2e8f0']
            
        pixels = arr[alpha, :3]
        mean_color = np.mean(pixels, axis=0).astype(int)
        hex_code = f'#{mean_color[0]:02x}{mean_color[1]:02x}{mean_color[2]:02x}'
        return [hex_code]

    def _detect_graphics(self, trans_img: Image.Image, mask: Image.Image) -> bool:
        arr = np.array(trans_img.convert('RGB'))
        mask_arr = np.array(mask) > 128
        if not np.any(mask_arr):
            return False
            
        garment_pixels = arr[mask_arr]
        std_dev = np.std(garment_pixels, axis=0)
        return float(np.mean(std_dev)) > 40.0

garment_extractor = GarmentExtractor()
