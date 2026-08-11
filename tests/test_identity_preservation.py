import pytest
from PIL import Image, ImageDraw
import numpy as np
from backend.postprocessing.compositing import compositor
from backend.postprocessing.quality_scorer import quality_scorer

def test_pixel_preservation_outside_mask():
    w, h = 512, 512
    # Create original image (e.g. checker pattern)
    orig_arr = np.random.randint(0, 255, (h, w, 3), dtype=np.uint8)
    orig_img = Image.fromarray(orig_arr)
    
    # Create generated image (all black)
    gen_img = Image.new('RGB', (w, h), (0, 0, 0))
    
    # Garment edit mask: small center circle
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([200, 200, 300, 300], fill=255)
    
    # Face mask at top
    face_mask = Image.new('L', (w, h), 0)
    draw_face = ImageDraw.Draw(face_mask)
    draw_face.rectangle([100, 50, 400, 150], fill=255)
    
    final_img = compositor.composite_with_preservation(
        original_img=orig_img,
        generated_img=gen_img,
        garment_mask=mask,
        face_mask=face_mask,
        feather_radius=0
    )
    
    final_arr = np.array(final_img)
    
    # Check that face zone is 100% pixel-identical to original
    assert np.array_equal(final_arr[50:150, 100:400], orig_arr[50:150, 100:400])
    
    # Check that corners (outside garment mask) are 100% pixel-identical to original
    assert np.array_equal(final_arr[0:100, 0:100], orig_arr[0:100, 0:100])
