import pytest
from PIL import Image, ImageDraw
import numpy as np
from pathlib import Path
from backend.preprocessing.garment_extractor import garment_extractor
from backend.core.config import PROCESSED_DIR

def test_garment_extractor_flatlay(tmp_path):
    img = Image.new('RGB', (400, 400), (240, 240, 240))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 300, 350], fill=(20, 20, 20))
    
    test_path = tmp_path / 'test_garment.png'
    img.save(test_path)
    
    asset = garment_extractor.extract(str(test_path), is_reference_person=False)
    assert asset.category == 'tops'
    assert asset.id is not None
    filename = Path(asset.transparent_path).name
    assert (PROCESSED_DIR / filename).exists()
