from fastapi import APIRouter, HTTPException
from backend.services.job_service import job_service

router = APIRouter(prefix='/api', tags=['Jobs'])

@router.get('/job/{job_id}')
async def get_job_status(job_id: str):
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f'Job {job_id} not found')
    return job
