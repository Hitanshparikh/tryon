import time
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from backend.core.config import GARMENTS_DIR
from backend.core.database import get_db
from backend.core.security import validate_and_save_upload
from backend.preprocessing.garment_extractor import garment_extractor
from backend.schemas.tryon_schemas import GarmentAsset

router = APIRouter(prefix='/api/wardrobe', tags=['Wardrobe'])

@router.get('', response_model=List[GarmentAsset])
async def list_wardrobe(category: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if category:
            cursor.execute('SELECT * FROM garments WHERE category=? ORDER BY created_at DESC', (category,))
        else:
            cursor.execute('SELECT * FROM garments ORDER BY created_at DESC')
        rows = cursor.fetchall()
        
        garments = []
        for r in rows:
            meta = json.loads(r['metadata_json']) if r['metadata_json'] else {}
            garments.append(GarmentAsset(
                id=r['id'],
                name=r['name'],
                category=r['category'],
                sub_category=r['sub_category'],
                sleeve_type=meta.get('sleeve_type', 'short'),
                dominant_colors=meta.get('dominant_colors', []),
                has_graphics=meta.get('has_graphics', False),
                original_path=r['original_image_path'],
                transparent_path=r['extracted_image_path'],
                mask_path=r['mask_path'],
                confidence=0.98
            ))
        return garments

@router.post('/upload', response_model=GarmentAsset)
async def upload_to_wardrobe(
    image: UploadFile = File(...),
    name: Optional[str] = Form(None),
    category_hint: Optional[str] = Form(None)
):
    saved_path = await validate_and_save_upload(image, GARMENTS_DIR)
    asset = garment_extractor.extract(str(saved_path), category_hint=category_hint)
    if name:
        asset.name = name
        
    with get_db() as conn:
        cursor = conn.cursor()
        meta = {
            'sleeve_type': asset.sleeve_type,
            'dominant_colors': asset.dominant_colors,
            'has_graphics': asset.has_graphics
        }
        cursor.execute(
            'INSERT INTO garments (id, name, category, sub_category, original_image_path, extracted_image_path, mask_path, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (asset.id, asset.name, asset.category, asset.sub_category, asset.original_path, asset.transparent_path, asset.mask_path, json.dumps(meta), time.time())
        )
        conn.commit()
    return asset

@router.delete('/{garment_id}')
async def delete_wardrobe_item(garment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM garments WHERE id=?', (garment_id,))
        conn.commit()
    return {'status': 'deleted', 'id': garment_id}
