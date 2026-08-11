import gc
import torch
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger('tryon.memory')

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.models = {}
            cls._instance.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        return cls._instance
    
    def register(self, name: str, model: Any, in_vram: bool = True):
        self.models[name] = {
            'model': model,
            'in_vram': in_vram
        }
        logger.info(f'Model registered: {name} (in_vram={in_vram})')
        
    def get(self, name: str) -> Optional[Any]:
        if name in self.models:
            return self.models[name]['model']
        return None
        
    def is_loaded(self, name: str) -> bool:
        return name in self.models and self.models[name]['model'] is not None
        
    def unload(self, name: str):
        if name in self.models:
            model = self.models[name]['model']
            del model
            del self.models[name]
            self.clean_vram()
            logger.info(f'Unloaded model: {name}')
            
    def clean_vram(self):
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
    def memory_usage(self) -> Dict[str, Any]:
        if not torch.cuda.is_available():
            return {
                'cuda_available': False,
                'device_name': 'CPU',
                'vram_allocated_gb': 0.0,
                'vram_reserved_gb': 0.0,
                'vram_total_gb': 0.0
            }
            
        allocated = torch.cuda.memory_allocated() / (1024 ** 3)
        reserved = torch.cuda.memory_reserved() / (1024 ** 3)
        total = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        
        return {
            'cuda_available': True,
            'device_name': torch.cuda.get_device_name(0),
            'vram_allocated_gb': round(allocated, 2),
            'vram_reserved_gb': round(reserved, 2),
            'vram_total_gb': round(total, 2),
            'vram_percent': round((reserved / total) * 100, 1) if total > 0 else 0
        }

model_manager = ModelManager()
