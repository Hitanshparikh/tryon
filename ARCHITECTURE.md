# Architecture & Pipeline Design

```
PERSON IMAGE              GARMENT IMAGE / REF PERSON           NATURAL LANGUAGE PROMPT
     │                                │                                  │
     ▼                                ▼                                  ▼
[Person Analysis]            [Garment Extraction]             [Prompt Interpreter]
 • Multi-Person Detect        • Rembg / Alpha Matting          • Fit (Oversized/Slim)
 • Pose Keypoints             • Sleeve Geometry Detect         • Sleeve Length Override
 • Face & Hair Protection     • Palette & Graphic Parser       • Invariant Constraints
     │                                │                                  │
     └───────────────┬────────────────┘                                  │
                     ▼                                                   │
        [Occlusion & Sleeve Logic]                                       │
         • Arm Synthesis Map                                             │
         • Crossed-Arm Foreground Mask                                   │
                     │                                                   │
                     └───────────────────┬───────────────────────────────┘
                                         ▼
                             [FASHN VTON v1.5 Engine]
                              • FP16 / BF16 CUDA Diffusion
                              • 20 - 45 Adaptive Steps
                                         │
                                         ▼
                           [Pixel-Exact Compositing]
                            • Target inside edit mask
                            • 100% Original outside mask
                            • Feathered Alpha Boundaries
                                         │
                                         ▼
                            [Quality & Face Scorer]
                            • Identity Match Verification
                            • Artifact & Background Check
                                         │
                                         ▼
                               [Final High-Res Output]
```

---

## Modular Subsystems

1. **`backend/preprocessing/garment_extractor.py`**: Handles flat-lay, mannequin, and reference-person garment isolation with automatic alpha matting and silhouette analysis.
2. **`backend/preprocessing/person_analyzer.py`**: Performs multi-person detection, face bounding box localization, and protective mask generation.
3. **`backend/preprocessing/sleeve_geometry.py`**: Computes long<->short sleeve geometry transformations and forearms skin synthesis masks.
4. **`backend/preprocessing/occlusion_handler.py`**: Handles layered occlusion (e.g. arms crossed in front of body, necklaces over shirts).
5. **`backend/preprocessing/prompt_interpreter.py`**: Normalizes user prompt inputs into deterministic pipeline configurations.
6. **`backend/postprocessing/compositing.py`**: Composites generated try-on output with original pixels to prevent face drift, hair distortion, and background shifting.
7. **`backend/postprocessing/quality_scorer.py`**: Evaluates identity preservation and generation confidence.
8. **`backend/core/memory.py`**: ModelManager with VRAM telemetry and automatic cache clearing.
