import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from PIL import Image

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024  # 30 MB max

def sanitize_filename(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = '.png'
    return f'{uuid.uuid4()}{ext}'

async def validate_and_save_upload(upload_file: UploadFile, target_dir: Path) -> Path:
    ext = Path(upload_file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f'Unsupported file extension: {ext}. Allowed: {list(ALLOWED_EXTENSIONS)}')
    
    file_bytes = await upload_file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f'File too large: {len(file_bytes)} bytes. Max allowed: {MAX_FILE_SIZE_BYTES} bytes.')
    
    unique_filename = sanitize_filename(upload_file.filename)
    target_path = target_dir / unique_filename
    
    # Save file
    with open(target_path, 'wb') as f:
        f.write(file_bytes)
    
    # Verify image integrity via Pillow
    try:
        with Image.open(target_path) as img:
            img.verify()
    except Exception as e:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(status_code=400, detail=f'Corrupted or invalid image file: {str(e)}')
        
    return target_path
