import pytest
from PIL import Image, ImageDraw
from pathlib import Path
from backend.preprocessing.person_analyzer import person_analyzer
from backend.core.config import PROCESSED_DIR

def test_person_analyzer(tmp_path):
    img = Image.new('RGB', (500, 700), (200, 200, 200))
    draw = ImageDraw.Draw(img)
    # Draw head
    draw.ellipse([200, 50, 300, 180], fill=(230, 190, 160))
    # Draw torso
    draw.rectangle([150, 180, 350, 500], fill=(50, 50, 200))
    
    test_path = tmp_path / 'test_person.png'
    img.save(test_path)
    
    result = person_analyzer.analyze(str(test_path))
    assert result.person_count >= 1
    
    face_fn = Path(result.face_protection_mask_path).name
    assert (PROCESSED_DIR / face_fn).exists()
    
    bg_fn = Path(result.background_protection_mask_path).name
    assert (PROCESSED_DIR / bg_fn).exists()
    
    garment_fn = Path(result.garment_region_mask_path).name
    assert (PROCESSED_DIR / garment_fn).exists()
