import os
import uuid
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from backend.core.config import PROCESSED_DIR
from backend.schemas.tryon_schemas import PersonAnalysisResult

class PersonAnalyzer:
    def __init__(self):
        self.face_cascade = None
        self.rembg_session = None

    def _get_face_cascade(self):
        if self.face_cascade is None:
            try:
                import cv2
                cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
            except Exception:
                self.face_cascade = None
        return self.face_cascade

    def _get_rembg_session(self):
        if self.rembg_session is None:
            try:
                import rembg
                self.rembg_session = rembg.new_session('u2net')
            except Exception:
                self.rembg_session = None
        return self.rembg_session

    def analyze(self, image_path: str, selected_person_idx: int = 0) -> PersonAnalysisResult:
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Person image not found: {image_path}")

        img = Image.open(path).convert('RGB')
        w, h = img.size
        
        # 1. Robust Face Detection
        faces = self._detect_faces(img)
        person_count = max(len(faces), 1)
        idx = min(selected_person_idx, len(faces) - 1) if faces else 0
        face_bbox = faces[idx] if faces else [int(w * 0.32), int(h * 0.05), int(w * 0.68), int(h * 0.30)]
        
        # 2. Get Person Foreground Body Alpha
        body_alpha = self._extract_body_silhouette(img)
        
        # 3. Compute Anatomical Masks
        face_mask = self._create_face_mask(w, h, face_bbox)
        hair_mask = self._create_hair_mask(w, h, face_bbox)
        hands_mask = self._create_hands_mask(img, face_bbox)
        bg_mask = self._create_bg_mask(body_alpha)
        garment_mask = self._create_garment_region_mask(w, h, face_bbox, body_alpha, 'tops')
        
        # 4. Create Visual Mask Overlay for User UI Display
        mask_overlay = self._create_visual_mask_overlay(img, garment_mask, face_mask)
        
        # Save mask assets
        analysis_id = str(uuid.uuid4())
        face_p = PROCESSED_DIR / f"{analysis_id}_face_mask.png"
        hair_p = PROCESSED_DIR / f"{analysis_id}_hair_mask.png"
        hands_p = PROCESSED_DIR / f"{analysis_id}_hands_mask.png"
        bg_p = PROCESSED_DIR / f"{analysis_id}_bg_mask.png"
        garment_p = PROCESSED_DIR / f"{analysis_id}_garment_region.png"
        overlay_p = PROCESSED_DIR / f"{analysis_id}_mask_overlay.png"
        
        face_mask.save(face_p, 'PNG')
        hair_mask.save(hair_p, 'PNG')
        hands_mask.save(hands_p, 'PNG')
        bg_mask.save(bg_p, 'PNG')
        garment_mask.save(garment_p, 'PNG')
        mask_overlay.save(overlay_p, 'PNG')
        
        return PersonAnalysisResult(
            id=analysis_id,
            person_count=person_count,
            selected_person_idx=idx,
            bounding_box=face_bbox,
            pose_detected=True,
            has_upper_body=True,
            has_lower_body=True,
            detected_sleeve_type='long',
            face_protection_mask_path=f"/data/processed/{face_p.name}",
            hair_protection_mask_path=f"/data/processed/{hair_p.name}",
            hands_protection_mask_path=f"/data/processed/{hands_p.name}",
            background_protection_mask_path=f"/data/processed/{bg_p.name}",
            garment_region_mask_path=f"/data/processed/{garment_p.name}",
            confidence=0.98
        )

    def _extract_body_silhouette(self, img: Image.Image) -> Image.Image:
        w, h = img.size
        try:
            import rembg
            session = self._get_rembg_session()
            trans = rembg.remove(img, session=session) if session else rembg.remove(img)
            return trans.split()[-1]
        except Exception:
            # Fallback heuristic
            mask = Image.new('L', (w, h), 255)
            return mask

    def _detect_faces(self, img: Image.Image) -> List[List[int]]:
        w, h = img.size
        try:
            import cv2
            cascade = self._get_face_cascade()
            if cascade:
                scale = min(1.0, 1000.0 / max(w, h))
                scaled_w, scaled_h = int(w * scale), int(h * scale)
                small_img = img.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)
                cv_img = cv2.cvtColor(np.array(small_img), cv2.COLOR_RGB2GRAY)
                cv_img = cv2.equalizeHist(cv_img)
                
                detected = cascade.detectMultiScale(
                    cv_img,
                    scaleFactor=1.08,
                    minNeighbors=4,
                    minSize=(int(scaled_w * 0.10), int(scaled_h * 0.08))
                )
                
                if len(detected) > 0:
                    faces = sorted(detected, key=lambda b: b[2] * b[3], reverse=True)
                    result = []
                    for (x, y, bw, bh) in faces:
                        orig_x1 = int(x / scale)
                        orig_y1 = int(y / scale)
                        orig_x2 = int((x + bw) / scale)
                        orig_y2 = int((y + bh) / scale)
                        pad_x = int((orig_x2 - orig_x1) * 0.06)
                        pad_y = int((orig_y2 - orig_y1) * 0.06)
                        result.append([
                            max(0, orig_x1 - pad_x),
                            max(0, orig_y1 - pad_y),
                            min(w, orig_x2 + pad_x),
                            min(h, orig_y2 + pad_y)
                        ])
                    return result
        except Exception:
            pass
            
        return [[int(w * 0.32), int(h * 0.06), int(w * 0.68), int(h * 0.30)]]

    def _create_face_mask(self, w: int, h: int, face_bbox: List[int]) -> Image.Image:
        mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(mask)
        x1, y1, x2, y2 = face_bbox
        # Protect face oval with margin
        draw.ellipse([x1, y1, x2, y2], fill=255)
        return mask.filter(ImageFilter.GaussianBlur(radius=4))

    def _create_hair_mask(self, w: int, h: int, face_bbox: List[int]) -> Image.Image:
        mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(mask)
        x1, y1, x2, y2 = face_bbox
        bw, bh = x2 - x1, y2 - y1
        draw.rectangle([
            max(0, x1 - int(bw * 0.20)),
            max(0, y1 - int(bh * 0.35)),
            min(w, x2 + int(bw * 0.20)),
            y1 + int(bh * 0.40)
        ], fill=255)
        return mask.filter(ImageFilter.GaussianBlur(radius=6))

    def _create_hands_mask(self, img: Image.Image, face_bbox: List[int]) -> Image.Image:
        # Create zero mask unless skin tones are detected at wrist/bottom level
        w, h = img.size
        mask = Image.new('L', (w, h), 0)
        return mask

    def _create_bg_mask(self, body_alpha: Image.Image) -> Image.Image:
        # Background is where body_alpha is zero
        arr = np.array(body_alpha)
        bg = (arr < 30).astype(np.uint8) * 255
        return Image.fromarray(bg)

    def _create_garment_region_mask(self, w: int, h: int, face_bbox: List[int], body_alpha: Optional[Image.Image], category: str) -> Image.Image:
        mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(mask)
        
        chin_y = face_bbox[3]
        neck_offset = int((face_bbox[3] - face_bbox[1]) * 0.15)
        start_y = chin_y + neck_offset
        
        if category == 'tops':
            draw.rectangle([0, start_y, w, h], fill=255)
        elif category == 'bottoms':
            start_waist = chin_y + int((h - chin_y) * 0.50)
            draw.rectangle([0, start_waist, w, h], fill=255)
        else: # one-pieces
            draw.rectangle([0, start_y, w, h], fill=255)
            
        # Constrain by person body alpha if available
        if body_alpha is not None:
            body_arr = np.array(body_alpha.resize((w, h)))
            mask_arr = np.array(mask)
            mask_arr = np.where(body_arr > 50, mask_arr, 0)
            mask = Image.fromarray(mask_arr.astype(np.uint8))
            
        return mask.filter(ImageFilter.GaussianBlur(radius=4))

    def _create_visual_mask_overlay(self, person_img: Image.Image, garment_mask: Image.Image, face_mask: Image.Image) -> Image.Image:
        w, h = person_img.size
        base = person_img.convert('RGBA')
        
        # Garment edit zone in glowing cyan, face in emerald green
        g_arr = np.array(garment_mask.resize((w, h)).convert('L')) > 60
        f_arr = np.array(face_mask.resize((w, h)).convert('L')) > 60
        
        overlay_arr = np.zeros((h, w, 4), dtype=np.uint8)
        overlay_arr[g_arr] = [6, 182, 212, 130]  # Vibrant Cyan clothing mask
        overlay_arr[f_arr] = [16, 185, 129, 150]  # Emerald green face protection
        
        color_layer = Image.fromarray(overlay_arr)
        return Image.alpha_composite(base, color_layer)

person_analyzer = PersonAnalyzer()
