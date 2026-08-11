import numpy as np
from PIL import Image, ImageFilter, ImageOps
from typing import Optional

class Compositor:
    @staticmethod
    def composite_with_preservation(
        original_img: Image.Image,
        generated_img: Image.Image,
        garment_mask: Image.Image,
        face_mask: Optional[Image.Image] = None,
        hair_mask: Optional[Image.Image] = None,
        hands_mask: Optional[Image.Image] = None,
        foreground_mask: Optional[Image.Image] = None,
        feather_radius: int = 4
    ) -> Image.Image:
        # Match dimensions
        w, h = original_img.size
        if generated_img.size != (w, h):
            generated_img = generated_img.resize((w, h), Image.Resampling.LANCZOS)
        if garment_mask.size != (w, h):
            garment_mask = garment_mask.resize((w, h), Image.Resampling.NEAREST)
            
        orig_arr = np.array(original_img.convert('RGB')).astype(np.float32)
        gen_arr = np.array(generated_img.convert('RGB')).astype(np.float32)
        
        # Start with garment edit mask
        blend_mask = np.array(garment_mask.convert('L')).astype(np.float32) / 255.0
        
        # Exclude protected zones (face, hair, hands, foreground occlusions)
        if face_mask is not None:
            fm = np.array(face_mask.resize((w, h)).convert('L')).astype(np.float32) / 255.0
            blend_mask = np.clip(blend_mask - fm, 0.0, 1.0)
            
        if hair_mask is not None:
            hm = np.array(hair_mask.resize((w, h)).convert('L')).astype(np.float32) / 255.0
            blend_mask = np.clip(blend_mask - hm, 0.0, 1.0)
            
        if hands_mask is not None:
            hdm = np.array(hands_mask.resize((w, h)).convert('L')).astype(np.float32) / 255.0
            blend_mask = np.clip(blend_mask - hdm, 0.0, 1.0)
            
        if foreground_mask is not None:
            fgm = np.array(foreground_mask.resize((w, h)).convert('L')).astype(np.float32) / 255.0
            blend_mask = np.clip(blend_mask - fgm, 0.0, 1.0)
            
        # Smooth and feather boundary
        blend_mask_pil = Image.fromarray((blend_mask * 255.0).astype(np.uint8))
        if feather_radius > 0:
            blend_mask_pil = blend_mask_pil.filter(ImageFilter.GaussianBlur(radius=feather_radius))
        
        smooth_alpha = np.array(blend_mask_pil).astype(np.float32) / 255.0
        smooth_alpha = np.expand_dims(smooth_alpha, axis=-1)  # (H, W, 1)
        
        # Composite: Generated inside mask, Original 100% preserved outside
        final_arr = (gen_arr * smooth_alpha) + (orig_arr * (1.0 - smooth_alpha))
        final_arr = np.clip(final_arr, 0.0, 255.0).astype(np.uint8)
        
        return Image.fromarray(final_arr)

compositor = Compositor()
