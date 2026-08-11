from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from PIL import Image

class ProviderInterface(ABC):
    @abstractmethod
    def generate_try_on(self, person_img: Image.Image, garment_img: Image.Image, category: str, steps: int = 30, prompt: Optional[str] = None) -> Image.Image:
        pass
        
    @abstractmethod
    def generate_edit(self, image: Image.Image, mask: Image.Image, prompt: str) -> Image.Image:
        pass
        
    @abstractmethod
    def upscale(self, image: Image.Image, scale_factor: int = 2) -> Image.Image:
        pass
        
    @abstractmethod
    def analyze_image(self, image: Image.Image) -> Dict[str, Any]:
        pass

class RemoteApiProvider(ProviderInterface):
    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        self.api_key = api_key
        self.endpoint = endpoint
        self.is_configured = bool(api_key and endpoint)
        
    def generate_try_on(self, person_img: Image.Image, garment_img: Image.Image, category: str, steps: int = 30, prompt: Optional[str] = None) -> Image.Image:
        if not self.is_configured:
            raise NotImplementedError('Remote provider is not configured. Falling back to local engine.')
        return person_img
        
    def generate_edit(self, image: Image.Image, mask: Image.Image, prompt: str) -> Image.Image:
        return image
        
    def upscale(self, image: Image.Image, scale_factor: int = 2) -> Image.Image:
        w, h = image.size
        return image.resize((w * scale_factor, h * scale_factor), Image.Resampling.LANCZOS)
        
    def analyze_image(self, image: Image.Image) -> Dict[str, Any]:
        return {'status': 'ok'}
