import pytest
from PIL import Image, ImageDraw
from backend.inference.fashn_engine import fashn_engine
from backend.preprocessing.prompt_interpreter import prompt_interpreter

def test_fashn_vton_pipeline_execution():
    person_img = Image.new('RGB', (400, 600), (220, 220, 220))
    p_draw = ImageDraw.Draw(person_img)
    p_draw.ellipse([160, 40, 240, 140], fill=(230, 180, 150)) # face
    p_draw.rectangle([120, 140, 280, 400], fill=(30, 60, 180)) # shirt

    garment_img = Image.new('RGB', (300, 300), (255, 255, 255))
    g_draw = ImageDraw.Draw(garment_img)
    g_draw.rectangle([50, 50, 250, 250], fill=(20, 20, 20)) # black tee

    prompt_spec = prompt_interpreter.parse('Make it short sleeve black oversized t-shirt')

    res = fashn_engine.generate(
        person_img=person_img,
        garment_img=garment_img,
        category='tops',
        steps=20,
        seed=42,
        prompt_spec=prompt_spec
    )

    assert res['image'] is not None
    assert res['seed'] == 42
    assert res['quality_metrics'].overall_confidence > 0.80
    assert res['quality_metrics'].identity_score > 0.90
