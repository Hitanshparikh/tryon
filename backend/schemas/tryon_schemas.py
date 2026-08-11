from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GarmentAsset(BaseModel):
    id: str
    name: Optional[str] = 'Garment'
    category: str = 'tops'  # tops, bottoms, one-pieces, outerwear
    sub_category: Optional[str] = 'tshirt'
    sleeve_type: Optional[str] = 'short'  # short, long, sleeveless
    neckline: Optional[str] = 'round'
    silhouette: Optional[str] = 'regular'
    dominant_colors: List[str] = []
    has_graphics: bool = False
    original_path: str
    transparent_path: str
    mask_path: Optional[str] = None
    confidence: float = 0.95

class PersonAnalysisResult(BaseModel):
    id: str
    person_count: int = 1
    selected_person_idx: int = 0
    bounding_box: List[int] = []  # [x1, y1, x2, y2]
    pose_detected: bool = True
    has_upper_body: bool = True
    has_lower_body: bool = True
    detected_sleeve_type: str = 'long'
    face_protection_mask_path: Optional[str] = None
    hair_protection_mask_path: Optional[str] = None
    skin_protection_mask_path: Optional[str] = None
    hands_protection_mask_path: Optional[str] = None
    background_protection_mask_path: Optional[str] = None
    garment_region_mask_path: Optional[str] = None
    confidence: float = 0.98

class StructuredPrompt(BaseModel):
    category: Optional[str] = None
    garment_type: Optional[str] = None
    fit: str = 'regular'  # slim, regular, oversized, relaxed, tight
    sleeve_length: Optional[str] = None  # short, long, sleeveless
    tuck: str = 'untucked'  # tucked, untucked
    material: Optional[str] = None
    preserve_graphics: bool = True
    preserve_identity: bool = True
    preserve_background: bool = True
    lighting: str = 'match_original'
    color_override: Optional[str] = None

class TryOnRequest(BaseModel):
    person_image: str  # Path or base64
    garment_image: str  # Path or base64
    reference_person_image: Optional[str] = None
    category: str = 'tops'  # tops, bottoms, one-pieces
    mode: str = 'balanced'  # fast, balanced, quality, selective
    steps: int = 30
    seed: Optional[int] = None
    prompt: Optional[str] = None
    selective_mask: Optional[str] = None
    preservation_strength: float = 0.85
    garment_adherence: float = 0.85
    candidate_count: int = 1

class QualityMetrics(BaseModel):
    identity_score: float = 0.95
    garment_score: float = 0.92
    anatomy_score: float = 0.96
    preservation_score: float = 0.98
    overall_confidence: float = 0.95
    retries_performed: int = 0

class TryOnResponse(BaseModel):
    job_id: str
    status: str = 'completed'
    result_image_url: str
    comparison_image_url: Optional[str] = None
    category: str
    mode: str
    steps: int
    seed: int
    duration_seconds: float
    quality_metrics: QualityMetrics
    model_name: str = 'FASHN VTON v1.5'
