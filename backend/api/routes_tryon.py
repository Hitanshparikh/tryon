import os
import uuid
import time
import json
import asyncio
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from PIL import Image
from backend.core.config import UPLOADS_DIR, GARMENTS_DIR, OUTPUTS_DIR, PROCESSED_DIR
from backend.core.database import get_db
from backend.core.security import validate_and_save_upload
from backend.preprocessing.prompt_interpreter import prompt_interpreter
from backend.inference.fashn_engine import fashn_engine
from backend.services.job_service import job_service
from backend.schemas.tryon_schemas import TryOnResponse, QualityMetrics

router = APIRouter(prefix='/api', tags=['Try-On'])

def process_tryon_task(
    job_id: str,
    person_path: str,
    garment_path: str,
    category: str,
    mode: str,
    steps: int,
    seed: Optional[int],
    prompt_text: Optional[str],
    selective_mask_path: Optional[str]
):
    try:
        def update_progress(p: int, stage: str):
            job_service.update_job(job_id, progress=p, stage=stage)

        p_img = Image.open(person_path).convert('RGB')
        g_img = Image.open(garment_path).convert('RGB')
        
        prompt_spec = prompt_interpreter.parse(prompt_text)
        sel_mask = Image.open(selective_mask_path).convert('L') if selective_mask_path and os.path.exists(selective_mask_path) else None
        
        # Execute VTON
        res = fashn_engine.generate(
            person_img=p_img,
            garment_img=g_img,
            category=category,
            steps=steps,
            seed=seed,
            prompt_spec=prompt_spec,
            selective_mask=sel_mask,
            progress_callback=update_progress
        )
        
        # Save output images
        gen_id = str(uuid.uuid4())
        out_path = OUTPUTS_DIR / f'{gen_id}_result.png'
        res['image'].save(out_path, 'PNG')
        
        # Save Side-by-Side Comparison
        pw, ph = p_img.size
        comp_img = Image.new('RGB', (pw * 2, ph))
        comp_img.paste(p_img, (0, 0))
        comp_img.paste(res['image'], (pw, 0))
        comp_path = OUTPUTS_DIR / f'{gen_id}_comparison.png'
        comp_img.save(comp_path, 'PNG')
        
        resp_data = {
            'job_id': job_id,
            'result_image_url': f'/data/outputs/{out_path.name}',
            'comparison_image_url': f'/data/outputs/{comp_path.name}',
            'category': category,
            'mode': mode,
            'steps': res['steps'],
            'seed': res['seed'],
            'duration_seconds': res['duration_seconds'],
            'quality_metrics': res['quality_metrics'].model_dump() if hasattr(res['quality_metrics'], 'model_dump') else res['quality_metrics'].dict(),
            'model_name': res['model_name']
        }
        
        # Save to SQLite history
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO generations (id, person_image_path, garment_image_path, result_image_path, comparison_image_path, category, mode, steps, seed, prompt, quality_metrics_json, duration_seconds, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (gen_id, person_path, garment_path, str(out_path), str(comp_path), category, mode, res['steps'], res['seed'], prompt_text, json.dumps(resp_data['quality_metrics']), res['duration_seconds'], 'completed', time.time())
            )
            conn.commit()
            
        job_service.update_job(job_id, progress=100, stage='Completed successfully', status='completed', result=resp_data)
        
    except Exception as e:
        job_service.update_job(job_id, progress=100, stage='Failed', status='failed', error=str(e))

@router.post('/try-on')
async def create_tryon_generation(
    background_tasks: BackgroundTasks,
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: str = Form('tops'),
    mode: str = Form('balanced'),
    steps: int = Form(30),
    seed: Optional[int] = Form(None),
    prompt: Optional[str] = Form(None),
    selective_mask: Optional[UploadFile] = File(None)
):
    person_path = await validate_and_save_upload(person_image, UPLOADS_DIR)
    garment_path = await validate_and_save_upload(garment_image, GARMENTS_DIR)
    sel_mask_path = await validate_and_save_upload(selective_mask, PROCESSED_DIR) if selective_mask else None
    
    job_id = job_service.create_job('try-on')
    
    background_tasks.add_task(
        process_tryon_task,
        job_id=job_id,
        person_path=str(person_path),
        garment_path=str(garment_path),
        category=category,
        mode=mode,
        steps=steps,
        seed=seed,
        prompt_text=prompt,
        selective_mask_path=str(sel_mask_path) if sel_mask_path else None
    )
    
    return {'job_id': job_id, 'status': 'queued'}

@router.get('/generations')
async def list_generations():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM generations ORDER BY created_at DESC LIMIT 50')
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            res_p = os.path.basename(r['result_image_path'])
            comp_p = os.path.basename(r['comparison_image_path']) if r['comparison_image_path'] else None
            results.append({
                'id': r['id'],
                'result_image_url': f'/data/outputs/{res_p}',
                'comparison_image_url': f'/data/outputs/{comp_p}' if comp_p else None,
                'category': r['category'],
                'mode': r['mode'],
                'steps': r['steps'],
                'seed': r['seed'],
                'prompt': r['prompt'],
                'quality_metrics': json.loads(r['quality_metrics_json']) if r['quality_metrics_json'] else {},
                'duration_seconds': r['duration_seconds'],
                'created_at': r['created_at']
            })
        return results
