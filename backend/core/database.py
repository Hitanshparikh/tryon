import sqlite3
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.core.config import DB_PATH

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Garments Library table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS garments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                sub_category TEXT,
                original_image_path TEXT NOT NULL,
                extracted_image_path TEXT NOT NULL,
                mask_path TEXT,
                metadata_json TEXT,
                created_at REAL NOT NULL
            )
        ''')
        
        # Generations & Try-On History
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS generations (
                id TEXT PRIMARY KEY,
                person_image_path TEXT NOT NULL,
                garment_id TEXT,
                garment_image_path TEXT NOT NULL,
                result_image_path TEXT NOT NULL,
                comparison_image_path TEXT,
                category TEXT NOT NULL,
                mode TEXT NOT NULL,
                steps INTEGER NOT NULL,
                seed INTEGER NOT NULL,
                prompt TEXT,
                quality_metrics_json TEXT,
                duration_seconds REAL,
                status TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        ''')
        
        # Async Jobs Tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                progress INTEGER NOT NULL,
                stage TEXT NOT NULL,
                result_json TEXT,
                error_message TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        ''')
        
        conn.commit()

init_db()
