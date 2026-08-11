from fastapi import APIRouter
from backend.core.memory import model_manager

router = APIRouter(prefix='/api', tags=['Models'])

@router.get('/health')
async def health_check():
    return {'status': 'healthy', 'service': 'AI Virtual Try-On Studio'}

@router.get('/models')
async def get_models_status():
    mem = model_manager.memory_usage()
    return {
        'hardware': mem,
        'models': [
            {
                'id': 'fashn-vton-1.5',
                'name': 'FASHN VTON v1.5',
                'license': 'Apache-2.0',
                'status': 'Loaded' if model_manager.is_loaded('fashn_vton') else 'Ready',
                'vram_usage': '2.1 GB',
                'primary': True
            },
            {
                'id': 'u2net-matting',
                'name': 'U2Net Segmenter / Rembg',
                'license': 'Apache-2.0',
                'status': 'Ready',
                'vram_usage': '0.3 GB',
                'primary': True
            },
            {
                'id': 'cat-vton',
                'name': 'CatVTON Fallback Engine',
                'license': 'CC BY-NC-SA 4.0 (Non-Commercial)',
                'status': 'Optional',
                'vram_usage': '3.2 GB',
                'primary': False
            }
        ]
    }
