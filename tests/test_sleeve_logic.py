import pytest
from PIL import Image
import numpy as np
from backend.preprocessing.sleeve_geometry import sleeve_engine

def test_sleeve_delta_long_to_short():
    res = sleeve_engine.compute_sleeve_delta('long', 'short', 768, 1024)
    assert res['is_long_to_short'] is True
    assert res['is_short_to_long'] is False
    assert res['requires_skin_synthesis'] is True
    assert isinstance(res['arm_reconstruction_mask'], Image.Image)
    
    # Check that mask has non-zero region for forearm reconstruction
    arr = np.array(res['arm_reconstruction_mask'])
    assert np.sum(arr > 0) > 1000

def test_sleeve_delta_short_to_long():
    res = sleeve_engine.compute_sleeve_delta('short', 'long', 768, 1024)
    assert res['is_long_to_short'] is False
    assert res['is_short_to_long'] is True
