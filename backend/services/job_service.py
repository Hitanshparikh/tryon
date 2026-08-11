import time
import uuid
import json
import asyncio
from typing import Dict, Any, Optional
from backend.core.database import get_db

class JobService:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        
    def create_job(self, job_type: str) -> str:
        job_id = str(uuid.uuid4())
        now = time.time()
        job_data = {
            'id': job_id,
            'type': job_type,
            'status': 'queued',
            'progress': 0,
            'stage': 'Initializing job...',
            'result': None,
            'error': None,
            'created_at': now,
            'updated_at': now
        }
        self.jobs[job_id] = job_data
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO jobs (id, type, status, progress, stage, result_json, error_message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (job_id, job_type, 'queued', 0, 'Initializing job...', None, None, now, now)
            )
            conn.commit()
            
        return job_id

    def update_job(self, job_id: str, progress: int, stage: str, status: str = 'processing', result: Optional[Dict[str, Any]] = None, error: Optional[str] = None):
        now = time.time()
        if job_id in self.jobs:
            self.jobs[job_id]['progress'] = progress
            self.jobs[job_id]['stage'] = stage
            self.jobs[job_id]['status'] = status
            self.jobs[job_id]['updated_at'] = now
            if result:
                self.jobs[job_id]['result'] = result
            if error:
                self.jobs[job_id]['error'] = error
                
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE jobs SET progress=?, stage=?, status=?, result_json=?, error_message=?, updated_at=? WHERE id=?',
                (progress, stage, status, json.dumps(result) if result else None, error, now, job_id)
            )
            conn.commit()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        if job_id in self.jobs:
            return self.jobs[job_id]
            
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM jobs WHERE id=?', (job_id,))
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'type': row['type'],
                    'status': row['status'],
                    'progress': row['progress'],
                    'stage': row['stage'],
                    'result': json.loads(row['result_json']) if row['result_json'] else None,
                    'error': row['error_message'],
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at']
                }
        return None

job_service = JobService()
