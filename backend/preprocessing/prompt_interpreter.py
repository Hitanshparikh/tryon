import re
from typing import Optional
from backend.schemas.tryon_schemas import StructuredPrompt

class PromptInterpreter:
    @staticmethod
    def parse(prompt_text: Optional[str]) -> StructuredPrompt:
        if not prompt_text or not prompt_text.strip():
            return StructuredPrompt()
            
        p = prompt_text.lower().strip()
        spec = StructuredPrompt()
        
        # Fit interpretation
        if 'oversized' in p or 'baggy' in p or 'loose' in p:
            spec.fit = 'oversized'
        elif 'slim' in p or 'tight' in p or 'fitted' in p:
            spec.fit = 'slim'
        elif 'relaxed' in p:
            spec.fit = 'relaxed'
            
        # Sleeve interpretation
        if 'short sleeve' in p or 'short sleeves' in p or 'half sleeve' in p:
            spec.sleeve_length = 'short'
        elif 'long sleeve' in p or 'long sleeves' in p or 'full sleeve' in p:
            spec.sleeve_length = 'long'
        elif 'sleeveless' in p or 'tank' in p or 'crop' in p:
            spec.sleeve_length = 'sleeveless'
            
        # Category interpretation
        if any(w in p for w in ['t-shirt', 'tshirt', 'tee', 'shirt', 'polo', 'hoodie', 'sweatshirt', 'sweater', 'jacket', 'blazer', 'coat', 'top', 'blouse']):
            spec.category = 'tops'
        elif any(w in p for w in ['jeans', 'pants', 'trousers', 'shorts', 'skirt', 'chinos', 'bottom']):
            spec.category = 'bottoms'
        elif any(w in p for w in ['dress', 'jumpsuit', 'romper', 'gown', 'one-piece']):
            spec.category = 'one-pieces'
            
        # Tuck status
        if 'tucked' in p and 'untucked' not in p:
            spec.tuck = 'tucked'
        elif 'untucked' in p:
            spec.tuck = 'untucked'
            
        # Graphic preservation preference
        if 'remove logo' in p or 'without graphic' in p or 'plain' in p:
            spec.preserve_graphics = False
        else:
            spec.preserve_graphics = True
            
        # Color override detection
        color_matches = re.findall(r'\b(black|white|blue|red|green|yellow|grey|gray|pink|purple|brown|beige|orange|navy)\b', p)
        if 'change color to' in p or 'make it' in p or 'in color' in p:
            if color_matches:
                spec.color_override = color_matches[-1]
                
        # Non-negotiable identity preservation
        spec.preserve_identity = True
        spec.preserve_background = True
        spec.lighting = 'match_original'
        
        return spec

prompt_interpreter = PromptInterpreter()
