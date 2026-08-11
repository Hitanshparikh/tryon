from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.core.config import UPLOADS_DIR, GARMENTS_DIR
from backend.core.security import validate_and_save_upload
from backend.preprocessing.person_analyzer import person_analyzer
from backend.preprocessing.garment_extractor import garment_extractor
from backend.schemas.tryon_schemas import PersonAnalysisResult, GarmentAsset

router = APIRouter(prefix='/api', tags=['Analysis'])

@router.post('/analyze-person', response_model=PersonAnalysisResult)
async def analyze_person_endpoint(
    image: UploadFile = File(...),
    selected_idx: int = Form(0)
):
    saved_path = await validate_and_save_upload(image, UPLOADS_DIR)
    result = person_analyzer.analyze(str(saved_path), selected_person_idx=selected_idx)
    return result

@router.post('/analyze-garment', response_model=GarmentAsset)
async def analyze_garment_endpoint(
    image: UploadFile = File(...),
    is_reference_person: bool = Form(False),
    category_hint: str = Form(None)
):
    saved_path = await validate_and_save_upload(image, GARMENTS_DIR)
    result = garment_extractor.extract(str(saved_path), is_reference_person=is_reference_person, category_hint=category_hint)
    return result
