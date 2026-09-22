import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.core.config import DATA_DIR
from backend.api.routes_analysis import router as analysis_router
from backend.api.routes_wardrobe import router as wardrobe_router
from backend.api.routes_tryon import router as tryon_router
from backend.api.routes_jobs import router as jobs_router
from backend.api.routes_models import router as models_router

app = FastAPI(
    title='AI Virtual Try-On Studio API',
    description='Production-Grade AI Clothing Replacement & Virtual Try-On Pipeline',
    version='1.5.0'
)

# Enable CORS for local web interface & SaaS integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Mount Data static directory for serving uploads, outputs, and transparent assets
app.mount('/data', StaticFiles(directory=str(DATA_DIR)), name='data')

# Include API Routers
app.include_router(analysis_router)
app.include_router(wardrobe_router)
app.include_router(tryon_router)
app.include_router(jobs_router)
app.include_router(models_router)

@app.get('/')
async def root():
    return {
        'service': 'AI Virtual Try-On Studio API',
        'status': 'online',
        'docs': '/docs',
        'models': '/api/models'
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        'backend.main:app',
        host='127.0.0.1',
        port=8000,
        reload=True,
        reload_dirs=['backend'],
        reload_excludes=['data/*', '*.db', '*.png', '*.jpg', '*.jpeg', 'data/**']
    )
