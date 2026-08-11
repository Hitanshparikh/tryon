
# BUILD: Premium AI Virtual Try-On / Clothing Swapper

You are a senior AI engineer, computer-vision engineer, ML systems architect, and full-stack engineer.

I want you to design and build a **production-quality, highly realistic AI clothing replacement / virtual try-on application**.

This is NOT a simple image color changer.

The application must perform **actual garment replacement**.

Example:

Input person:

> A man wearing a long-sleeve formal shirt.

Garment:

> A short-sleeve T-shirt.

Expected output:

> The same man wearing the T-shirt naturally, with the original shirt genuinely removed, the T-shirt reconstructed according to the man's body, pose, perspective and lighting, and the man's arms becoming visible wherever the T-shirt does not cover them.

The system must understand clothing geometry rather than simply overlaying, recoloring, or texture-mapping an image.

---

# 1. PRIMARY OBJECTIVE

Build a premium AI-powered application that accepts:

### Person image

A photograph of a person.

### Garment image

Any of:

1. Flat-lay garment/product photo
2. Garment on mannequin
3. Garment worn by another person
4. E-commerce product image
5. Screenshot/photo of a garment
6. Garment photographed from a different angle

### Optional reference image

A second person wearing the desired garment.

### Optional natural-language instruction

Examples:

> Replace the shirt with this black oversized T-shirt.

> Make the T-shirt slightly oversized.

> Preserve the person's exact face, hairstyle, body proportions and background.

> Change the long sleeves to short sleeves according to the reference T-shirt.

> Make the garment fit naturally around the shoulders.

> Keep the original lighting.

> Make the fabric look realistic and preserve the exact logo.

The application should intelligently combine all available inputs.

---

# 2. CRITICAL PRINCIPLE

DO NOT build this as:

person image
+
garment image
=
image-to-image generation

That approach will unnecessarily modify faces, bodies, backgrounds and other details.

Instead build a controlled pipeline:

PERSON ANALYSIS
↓
GARMENT EXTRACTION
↓
GARMENT UNDERSTANDING
↓
POSE / BODY / DEPTH ANALYSIS
↓
CLOTHING REGION ANALYSIS
↓
AGNOSTIC PERSON REPRESENTATION
↓
VIRTUAL TRY-ON MODEL
↓
GEOMETRY / OCCLUSION VALIDATION
↓
IDENTITY / BACKGROUND PRESERVATION
↓
LOCAL REFINEMENT
↓
HIGH-RESOLUTION UPSCALE
↓
FINAL QUALITY CHECK

The clothing region should be allowed to change substantially.

Everything outside the intended edit region should be strongly preserved.

---

# 3. MODEL STRATEGY

Use a modular model architecture.

## PRIMARY VTON MODEL

Use:

### FASHN VTON v1.5

Repository:

https://github.com/fashn-AI/fashn-vton-1.5

Model:

https://huggingface.co/fashn-ai/fashn-vton-1.5

FASHN VTON v1.5 is specifically intended for photorealistic virtual try-on and supports:

- person image
- garment image
- model-worn garments
- flat-lay garments
- tops
- bottoms
- one-pieces

It is maskless and operates in pixel space.

The published implementation supports configurable inference steps and multiple samples. Use approximately:

FAST:
20 steps

BALANCED:
30 steps

QUALITY:
40–50 steps

Do NOT blindly use maximum steps for every request.

Implement adaptive quality.

Source:
https://github.com/fashn-AI/fashn-vton-1.5

---

# 4. LOCAL HARDWARE TARGET

The primary development target is:

GPU:
NVIDIA RTX 4060 8 GB

CPU:
Intel i7 13th generation

RAM:
8–16 GB

The system must be optimized for this hardware.

Prioritize:

- CUDA
- BF16 where supported
- FP16 fallback
- TF32
- inference mode
- memory-efficient attention
- model caching
- VRAM reuse
- CPU offloading only when necessary
- image resizing before inference
- asynchronous preprocessing
- batch size 1 by default

Do NOT unnecessarily load huge models.

A 50+ GB model such as Qwen-Image-Edit-2511 is NOT the primary local model because its published repository is roughly 57.7 GB and therefore unsuitable for this hardware target.

---

# 5. THREE ENGINE MODES

Implement three clearly separated engines.

## ENGINE A — LOCAL FAST

Primary:

FASHN VTON v1.5

Purpose:

Fast local unlimited generation.

Target:

RTX 4060 8 GB.

Quality:

High.

Use approximately:

20–30 inference steps.

This should be the default.

---

## ENGINE B — LOCAL QUALITY

Use FASHN VTON v1.5 with:

- higher resolution
- 40–50 steps
- stronger preprocessing
- better garment extraction
- stronger preservation masks
- optional multi-sample generation
- best-result selection
- refinement pass

The application should generate 2–4 candidates internally when requested and select the best one using quality scoring.

---

## ENGINE C — OPTIONAL REMOTE / PREMIUM

Architect a provider abstraction.

Do NOT hard-code the application around one API.

Create:

ProviderInterface

with:

generateTryOn()
generateEdit()
upscale()
analyzeImage()

The application should be capable of supporting external APIs later.

Potential providers can be configured through environment variables.

The remote engine must be OPTIONAL.

The application must remain fully functional locally without any paid API.

Do NOT make the application dependent on a paid API.

---

# 6. IMPORTANT LICENSE REQUIREMENT

Before downloading or bundling any model, inspect:

- model license
- code license
- dependency licenses
- commercial-use restrictions

Prefer permissive models for the main production path.

FASHN VTON v1.5 is published under Apache-2.0.

CatVTON is useful as a technical fallback but its released materials use CC BY-NC-SA 4.0, so do not silently use it in a commercial production path.

Create:

MODEL_LICENSES.md

listing every model and its license.

---

# 7. INPUT SYSTEM

Create a polished interface.

Three primary upload zones:

## PERSON

Upload the person photograph.

Accept:

- JPG
- JPEG
- PNG
- WEBP

## GARMENT

Upload:

- flat-lay garment
- product photo
- garment on model
- mannequin
- screenshot

## REFERENCE PERSON

Optional.

Upload a second person wearing the desired garment.

This should be treated as a garment reference, NOT as a person-identity reference.

---

# 8. GARMENT EXTRACTION

This is one of the most important components.

If the user uploads:

Person A wearing a T-shirt

we must extract:

- T-shirt silhouette
- sleeves
- collar
- neckline
- hem
- logos
- graphics
- pattern
- texture
- material appearance
- color
- garment structure

WITHOUT copying:

- Person A's face
- Person A's body
- Person A's skin
- Person A's hair
- Person A's background

Create a garment preprocessing pipeline.

Possible internal representation:

GarmentAsset:

{
  image,
  transparent_image,
  segmentation_mask,
  category,
  sleeve_type,
  neckline,
  silhouette,
  material,
  dominant_colors,
  pattern,
  logo_regions,
  estimated_view,
  confidence
}

---

# 9. GARMENT TYPES

Support at minimum:

TOPS:

- T-shirt
- shirt
- polo
- hoodie
- sweatshirt
- sweater
- jacket
- blazer
- coat
- tank top
- crop top
- blouse

BOTTOMS:

- jeans
- trousers
- chinos
- shorts
- skirts

ONE-PIECES:

- dress
- jumpsuit
- romper

Architect the category system so new categories can be added without rewriting the application.

---

# 10. SLEEVE LOGIC

This is CRITICAL.

The system must understand sleeve differences.

Example:

Original:

Long-sleeve shirt.

Target:

Short-sleeve T-shirt.

The result MUST NOT simply place the T-shirt texture over the existing sleeves.

Instead:

1. Detect original sleeves.
2. Detect target garment sleeve geometry.
3. Remove regions that should no longer exist.
4. Reconstruct visible arms.
5. Preserve skin appearance.
6. Generate correct sleeve boundaries.
7. Preserve hands.
8. Preserve pose.
9. Maintain realistic lighting and shadows.

The same logic must work in reverse.

Example:

Original:

Short-sleeve T-shirt.

Target:

Long-sleeve shirt.

The generated sleeves must extend naturally over the arms.

---

# 11. BODY PRESERVATION

The application must preserve:

- face
- eyes
- nose
- mouth
- ears
- hair
- skin tone
- body proportions
- hands
- fingers
- tattoos
- accessories
- jewelry
- watches
- shoes
- background

unless the user explicitly asks to modify them.

The VTON model is allowed to modify:

- original garment
- garment boundary
- occluded skin
- clothing folds
- clothing shadows
- clothing texture

Everything else should have a strong preservation constraint.

---

# 12. IDENTITY PRESERVATION

Create a protected identity region.

Use segmentation / face detection to create:

FACE_PROTECTION_MASK

Also preserve:

HAIR_MASK
SKIN_MASK
HANDS_MASK
ACCESSORY_MASK
BACKGROUND_MASK

During refinement, strongly discourage changes outside:

GARMENT_EDIT_MASK

Use masked/inpainting refinement rather than regenerating the whole image.

---

# 13. PERSON ANALYSIS

Before VTON inference, analyze:

- pose
- body keypoints
- body segmentation
- DensePose where useful
- person bounding box
- torso region
- arm positions
- hand positions
- clothing region
- depth/occlusion information

Use DWPose / suitable pose estimation for pose understanding.

The VTON pipeline should receive the best possible representation of the person's pose.

---

# 14. CLOTHING MASK

Do not use a simple rectangular crop.

Create an accurate garment-region representation.

Example:

Original:

shirt

Mask:

shoulders
+
torso
+
sleeves
+
collar
+
appropriate occlusion regions

But exclude:

face
neck where appropriate
hands
background
hair
unrelated accessories

The mask should be dynamically generated.

---

# 15. OCCLUSION HANDLING

This is essential for realism.

The system must understand:

foreground arms
behind garment
garment
body
background

Example:

Person crosses one arm over their torso.

The shirt must appear behind the arm.

Not over it.

Create an occlusion-aware compositing pipeline.

Potential representations:

- person segmentation
- DensePose
- depth estimation
- hand segmentation
- arm masks
- garment mask

Use these to determine foreground/background ordering.

---

# 16. GARMENT GEOMETRY

Do NOT treat the garment as a texture.

Infer:

- silhouette
- width
- length
- sleeve length
- sleeve circumference
- neckline
- shoulder width
- garment drape
- fabric structure

The generated garment should conform to:

- body pose
- perspective
- body proportions
- camera angle

---

# 17. REFERENCE PERSON MODE

When the user uploads:

PERSON A

GARMENT REFERENCE PERSON B

the application should:

1. Detect garment on B.
2. Extract garment appearance.
3. Remove B's identity/body information.
4. Transfer garment properties to A.
5. Adapt garment to A's pose and body.
6. Preserve A's identity.

Example:

Reference:

male model wearing oversized black graphic T-shirt.

Target:

different male wearing formal shirt.

Output:

target male wearing the same black graphic T-shirt.

The output must NOT become the reference person's face or body.

---

# 18. FLAT-LAY MODE

If the garment is photographed alone:

Example:

white T-shirt on a table.

The system should:

1. Remove background.
2. detect garment boundaries
3. identify front/back orientation
4. infer garment category
5. preserve graphic/logo
6. transfer garment onto target person
7. generate realistic folds

Do not simply paste the flat garment.

---

# 19. PRODUCT PHOTO MODE

Support typical e-commerce imagery:

white background
+
shirt.

Automatically isolate the garment.

Support transparent PNGs.

Support product images with shadows.

Avoid transferring the original background.

---

# 20. NATURAL LANGUAGE PROMPTING

Add an optional prompt box.

Examples:

"Make the T-shirt oversized."

"Keep the exact Nike-style graphic from the reference."

"Make the sleeves slightly shorter."

"Use a relaxed fit."

"Make the shirt untucked."

"Preserve the original lighting."

"Make the fabric cotton."

"Keep the person's face completely unchanged."

The prompt should modify the garment generation process, NOT override identity preservation.

---

# 21. PROMPT INTERPRETER

Do not directly feed the user's raw prompt into the image model.

First convert it into structured instructions.

Example:

User:

> Make it slightly oversized with shorter sleeves.

Internal:

{
  fit: "oversized",
  sleeve_length: "short",
  sleeve_adjustment: -0.15,
  preserve_identity: true
}

Then send the structured representation to the generation pipeline.

This reduces unpredictable model behavior.

---

# 22. PROMPT CONFLICT RESOLUTION

The system should prioritize:

1. Identity preservation
2. Human anatomy
3. Garment category
4. Garment structure
5. User instructions
6. Visual styling

Example:

User says:

> Make the shirt disappear completely.

This should not cause unrelated body/background destruction.

---

# 23. LOGO / GRAPHIC PRESERVATION

Garment graphics are extremely important.

If the garment contains:

- logo
- text
- artwork
- stripes
- embroidery
- pattern

preserve them as accurately as possible.

Create a garment-detail preservation step.

Do not allow the refinement model to hallucinate or rewrite recognizable graphics unnecessarily.

---

# 24. COLOR PRESERVATION

Do not regenerate a garment unnecessarily when the user only wants a color modification.

However, distinguish between:

COLOR CHANGE

and

GARMENT REPLACEMENT.

If the user asks:

"Change the shirt from blue to black."

use a localized editing path.

If:

"Replace shirt with this T-shirt."

use VTON.

---

# 25. MULTI-MODE OPERATION

Provide:

### MODE 1
Garment Swap

### MODE 2
Full Outfit

### MODE 3
Garment + Prompt

### MODE 4
Reference Garment

### MODE 5
Selective Edit

### MODE 6
Batch Try-On

---

# 26. SELECTIVE EDIT MODE

Allow the user to paint/select a region.

Examples:

- collar
- sleeves
- logo
- pants
- jacket
- entire upper body

Use brush/mask UI.

Allow:

ADD TO MASK

REMOVE FROM MASK

FEATHER

ERASE

RESET

---

# 27. BEFORE / AFTER UI

Provide:

Before / After slider.

Also:

Side-by-side mode.

Zoom.

Pan.

Full-screen.

Download.

---

# 28. GENERATION SETTINGS

Expose an Advanced Settings panel.

Controls:

Quality:

FAST
BALANCED
HIGH
ULTRA

Steps:

20
30
40
50

Seed:

Random / Fixed

Number of candidates:

1
2
4

Preservation strength:

Low
Medium
High

Garment adherence:

Low
Medium
High

Prompt strength:

Low
Medium
High

---

# 29. AUTOMATIC QUALITY SELECTION

If generating multiple candidates:

Do not simply return the first image.

Evaluate candidates using a quality scorer.

Potential signals:

- face similarity
- body similarity
- garment similarity
- garment-region consistency
- anatomical consistency
- hand preservation
- background preservation
- image sharpness
- artifact detection

Select the best candidate.

Show:

"Best match"

and optionally allow the user to view all candidates.

---

# 30. FACE SIMILARITY CHECK

After generation:

compare original face and output face.

If similarity falls below threshold:

automatically retry with stronger preservation.

Do not endlessly retry.

Use configurable:

MAX_RETRIES = 2

---

# 31. BACKGROUND PRESERVATION

Generate a background protection mask.

The background should remain pixel-identical whenever possible.

Do NOT regenerate the entire photograph just to change clothing.

This greatly improves consistency.

---

# 32. TWO-STAGE GENERATION

Use:

STAGE 1:
VTON generation.

STAGE 2:
localized refinement.

Stage 2 should only modify the garment region and necessary transition boundaries.

Do not run an expensive global image-to-image generation.

---

# 33. HIGH-RESOLUTION PIPELINE

For high-resolution images:

1. preprocess
2. downscale to model-compatible resolution
3. perform VTON
4. map result back to original dimensions
5. local detail refinement
6. upscale

Do not simply upscale a low-resolution generated image.

Preserve:

- face
- logos
- garment seams
- texture
- hair
- skin

---

# 34. IMAGE RESOLUTION STRATEGY

Automatically determine working resolution.

Examples:

Input:

4000×6000

Do not directly run 4000×6000 through the VTON model.

Instead:

- preserve original
- create working copy
- perform VTON at optimized resolution
- upscale/refine
- composite with original outside edit region

---

# 35. FAST PIPELINE

Target:

~5–15 seconds on RTX 4060 where technically achievable.

Do not sacrifice quality excessively.

Use:

- cached models
- GPU-resident model
- preprocessing concurrency
- asynchronous UI
- progress reporting
- efficient image resizing
- minimal model reloads

Never reload the VTON model for every generation.

---

# 36. MODEL MEMORY MANAGEMENT

Implement:

ModelManager

with:

load()
unload()
is_loaded()
device()
memory_usage()

Keep primary VTON model loaded while the application is active.

If VRAM becomes constrained:

use CPU offload or unload optional models.

Never crash because an optional refinement model cannot fit into VRAM.

---

# 37. WINDOWS SUPPORT

The primary local development environment should support Windows 11.

Provide:

setup_windows.ps1

and:

start_app.bat

Also provide:

requirements.txt

environment.yml

and:

README.md

---

# 38. APPLICATION ARCHITECTURE

Recommended stack:

Frontend:

React
TypeScript
Vite
Tailwind CSS

Backend:

Python
FastAPI

Inference:

PyTorch
CUDA
Diffusers where applicable
FASHN VTON

Image processing:

Pillow
OpenCV

Computer vision:

DWPose
human parsing / segmentation
DensePose where required

Queue:

simple in-process queue initially.

Architect so Redis/Celery can be added later.

---

# 39. PROJECT STRUCTURE

Create something similar to:

app/

frontend/
  src/
    components/
    pages/
    hooks/
    services/
    types/
    utils/

backend/
  api/
  core/
  models/
  inference/
    fashn/
    fallback/
    refinement/
  preprocessing/
    garment/
    person/
    segmentation/
    pose/
    masks/
  postprocessing/
    compositing/
    quality/
    preservation/
  services/
  schemas/

models/

scripts/

tests/

outputs/

docs/

README.md

MODEL_LICENSES.md

ARCHITECTURE.md

---

# 40. API DESIGN

Create clean endpoints.

POST /api/analyze-person

POST /api/analyze-garment

POST /api/extract-garment

POST /api/try-on

POST /api/refine

POST /api/upscale

GET /api/job/{id}

GET /api/health

GET /api/models

POST /api/batch

Use background jobs for generation.

---

# 41. JOB SYSTEM

Generation should return:

job_id

Frontend then receives progress:

0%
10%
25%
40%
60%
75%
90%
100%

Progress stages:

Uploading
Analyzing person
Analyzing garment
Extracting garment
Preparing masks
Running virtual try-on
Refining
Quality checking
Finalizing

---

# 42. CACHING

Cache:

- person analysis
- garment extraction
- segmentation
- pose
- masks

If the user tries the same garment on the same person again, do not recompute everything.

---

# 43. GARMENT LIBRARY

Allow users to save extracted garments.

Each garment:

- preview
- name
- category
- metadata
- original source image
- extracted transparent image

Then users can try the same garment on multiple people.

---

# 44. BATCH MODE

Allow:

1 person
+
multiple garments

Example:

person.jpg

shirt.jpg
tshirt.jpg
hoodie.jpg
jacket.jpg

Generate:

4 outputs.

Also support:

multiple people
+
one garment.

---

# 45. ERROR HANDLING

Never show raw Python stack traces to users.

Examples:

"No person detected."

"Multiple people detected. Please select one."

"Garment could not be isolated."

"Image resolution is too low."

"GPU memory is insufficient for this quality setting."

"Try the Fast mode."

---

# 46. MULTI-PERSON DETECTION

If multiple people exist:

detect all people.

Show selection UI:

Person 1
Person 2
Person 3

User selects target.

Only modify the selected person.

---

# 47. BODY-AWARE CLOTHING

The system should handle:

- standing
- sitting
- walking
- crossed arms
- hands in pockets
- side-facing
- 3/4 view
- frontal
- rear view where supported

Do not assume every photograph is front-facing.

If a pose is unsupported, gracefully reduce confidence rather than produce obviously broken anatomy.

---

# 48. GARMENT ORIENTATION

Detect:

front
back
side
unknown

If the garment image is back-facing but target needs front-facing, do not blindly mirror it.

Use available visual information to reconstruct the garment while preserving known details.

---

# 49. QUALITY SCORE

Create a score internally:

identity_score
garment_score
anatomy_score
preservation_score
artifact_score
overall_confidence

Do NOT necessarily expose the raw numerical score to users.

Use it internally for candidate selection.

---

# 50. ORIGINAL PIXEL PRESERVATION

This is one of the most important architectural decisions.

After generation:

take the generated image

and composite it with the original image:

FINAL =
GENERATED inside EDIT_REGION
+
ORIGINAL outside EDIT_REGION

with a carefully feathered boundary.

This prevents:

- face drift
- background drift
- hair changes
- skin changes
- jewelry changes

---

# 51. EDGE REFINEMENT

Garment boundaries require special handling.

Use:

- feathering
- alpha refinement
- local inpainting
- edge-aware blending

Pay special attention to:

- collar
- neckline
- shoulders
- sleeve openings
- wrists
- underarms
- garment hem

---

# 52. FABRIC REALISM

The final garment should contain realistic:

- folds
- wrinkles
- seams
- shadows
- highlights
- fabric texture
- tension around shoulders
- tension around elbows
- natural draping

Avoid:

flat pasted appearance

plastic texture

repeated texture patterns

unnatural folds

---

# 53. LIGHTING CONSISTENCY

Analyze original:

- light direction
- shadow direction
- exposure
- contrast
- white balance

The replacement garment should inherit the scene lighting.

If the source person is under warm indoor lighting, the garment should not appear artificially cool.

---

# 54. CAMERA / PERSPECTIVE CONSISTENCY

Match:

- camera perspective
- scale
- body orientation
- focal appearance
- image geometry

Do not generate a garment photographed from a different camera angle unless the model can correctly adapt it.

---

# 55. ACCESSORIES

Protect:

- necklace
- chain
- watch
- bracelet
- earrings
- glasses
- bags

If an accessory crosses the garment:

the accessory should remain in front.

Example:

necklace over T-shirt.

The necklace must not disappear underneath the generated garment.

---

# 56. HAIR / NECK HANDLING

If hair overlaps the shirt:

hair should remain in the foreground.

If the neckline exposes more neck:

reconstruct only the required region.

Do not alter the person's face.

---

# 57. SKIN RECONSTRUCTION

When replacing:

long sleeves → short sleeves

the newly exposed arms must be reconstructed naturally.

Skin should match:

- original tone
- lighting
- texture
- shadows
- existing arm anatomy

Do not generate a random arm.

Use the visible anatomy as reference.

---

# 58. NEGATIVE / PROTECTION PROMPT

The refinement system should internally enforce concepts such as:

preserve identity,
preserve facial features,
preserve hairstyle,
preserve body proportions,
preserve hands,
preserve background,
preserve accessories,
preserve original pose,
preserve camera perspective,
do not modify non-garment regions,
do not change facial expression,
do not hallucinate body parts,
do not duplicate limbs,
do not remove fingers.

---

# 59. SAFETY / PRIVACY ARCHITECTURE

Images should remain local by default.

Do not upload images to external services unless the user explicitly selects a remote provider.

Provide:

"Local processing"

indicator.

Temporary files should be cleaned automatically.

---

# 60. NO MANDATORY CLOUD

The application must work fully offline after models are downloaded.

Internet should only be required for:

- initial model download
- optional provider APIs
- optional updates

---

# 61. FREE / UNLIMITED STRATEGY

Do not claim that free cloud GPUs can guarantee unlimited compute.

Instead make the LOCAL engine the unlimited path.

The user's RTX 4060 becomes the primary unlimited inference machine.

Optional online engines can be plugged in later.

Do not design the core application around unstable free Colab sessions.

---

# 62. OPTIONAL ONLINE DEPLOYMENT

Architect a Docker container.

Provide:

Dockerfile

docker-compose.yml

Then make it compatible with GPU infrastructure.

Potential deployment targets can include:

- Hugging Face Spaces
- RunPod
- Vast.ai
- local server
- other CUDA hosts

But do not make paid infrastructure mandatory.

If a free service has temporary GPU availability, treat it as an optional deployment target, not a guaranteed unlimited backend.

---

# 63. COMFYUI COMPATIBILITY

Consider providing a ComfyUI workflow as an advanced option.

The official FASHN VTON implementation has already been integrated into ComfyUI by community tooling, so use that ecosystem where useful rather than reinventing every inference component.

But the main application must NOT require users to understand ComfyUI.

---

# 64. FALLBACK MODEL

Implement an abstraction for a second local VTON engine.

Candidate:

CatVTON.

CatVTON is particularly interesting because its authors report <8 GB VRAM for 1024×768 with BF16.

However, because its published materials are CC BY-NC-SA 4.0, keep it clearly separated as an optional non-commercial engine and do not mix its weights into the default commercial-compatible path.

---

# 65. DO NOT USE GIANT GENERAL IMAGE MODELS AS PRIMARY VTON

Do not make a generic 50+ GB image-edit model the primary engine simply because it produces beautiful images.

Generic image editors are much more likely to modify:

- face
- body
- hair
- background
- identity

than a dedicated VTON architecture.

A general image editor may be used later as a localized refinement tool.

---

# 66. QUALITY-FIRST FALLBACK LOGIC

Implement:

if FASHN VTON succeeds:
    refine locally

if confidence is low:
    try second candidate

if still low:
    try fallback VTON

if still low:
    show result with warning / request better input

Do not silently produce terrible results.

---

# 67. USER EXPERIENCE

The interface should feel like a premium AI product.

Not like a research demo.

Design:

clean
minimal
fast
modern
professional

Main layout:

LEFT:
Person

CENTER:
Garment

RIGHT:
Controls

Bottom:
Generate

After generation:

large result canvas

Before / After

Download

Try another garment

Regenerate

Refine

---

# 68. DRAG & DROP

Support:

drag person image

drag garment

drag reference

paste image from clipboard

---

# 69. IMAGE CROPPING

Automatically detect person.

Offer:

Original
Auto Crop
Full Body
Upper Body
Custom

---

# 70. TARGET REGION

Provide:

Auto

Upper Body

Lower Body

Full Body

Custom Mask

The system should automatically select the correct VTON category.

---

# 71. SMART CATEGORY DETECTION

If user uploads:

T-shirt

automatically detect:

tops

If jeans:

bottoms

If dress:

one-pieces

Allow manual override.

---

# 72. MODEL MANAGER

Create a UI page:

Models

FASHN VTON v1.5
Installed
~2 GB

DWPose
Installed

Human Parser
Installed

Optional CatVTON
Not Installed

This allows users to see what is installed.

---

# 73. FIRST-RUN SETUP

Create:

setup.py / setup.ps1

The application should automatically:

check NVIDIA GPU
check CUDA
check VRAM
create virtual environment
install dependencies
download model weights
verify weights
run test inference

At the end:

"System ready."

---

# 74. HARDWARE DETECTION

On startup detect:

GPU model
VRAM
CUDA version
PyTorch CUDA availability

Then automatically choose:

8 GB:
optimized mode

12–16 GB:
higher-quality mode

24+ GB:
ultra mode

CPU:
fallback mode

---

# 75. RTX 4060 OPTIMIZATION

Specifically optimize for:

RTX 4060 8GB

Use:

BF16 where appropriate
FP16 fallback
TF32
torch.inference_mode()
channels-last where beneficial
attention optimization
memory cleanup
CUDA synchronization only when required

Do not call torch.cuda.empty_cache() excessively because it can hurt performance.

---

# 76. IMAGE FORMAT

Internally use:

RGB

Convert:

RGBA → RGB

CMYK → RGB

WEBP → RGB

Handle EXIF orientation.

Preserve metadata where appropriate.

---

# 77. SEED REPRODUCIBILITY

Every generation should have a seed.

Display:

Seed: 284719

Allow:

Regenerate with same seed

Randomize seed

This is important for debugging and comparison.

---

# 78. TESTING

Create automated tests.

At minimum:

test_garment_segmentation.py

test_person_segmentation.py

test_pose.py

test_masks.py

test_vton.py

test_compositing.py

test_identity_preservation.py

test_api.py

test_batch.py

---

# 79. GOLDEN TEST IMAGES

Create a test suite containing:

1. short sleeve → long sleeve
2. long sleeve → short sleeve
3. shirt → T-shirt
4. T-shirt → shirt
5. shirt → hoodie
6. hoodie → jacket
7. jeans → trousers
8. trousers → jeans
9. flat-lay → person
10. person-wearing-garment → person
11. crossed arms
12. hands in pockets
13. sitting
14. side profile
15. multiple people
16. person with glasses
17. person with necklace
18. patterned garment
19. garment with logo
20. dark garment
21. white garment
22. complex background

---

# 80. AUTOMATIC REGRESSION TEST

For every test:

compare:

original face
original background
original hands

against output.

Detect unexpected changes.

This is critical.

---

# 81. PERFORMANCE BENCHMARK

Create benchmark script:

benchmark.py

Output:

preprocessing time
VTON time
refinement time
total time
VRAM peak
RAM peak
resolution
steps
seed

Example:

FASHN VTON
768×1024
30 steps
RTX 4060

Time:
X seconds

VRAM:
X GB

Do not invent benchmark numbers.

Measure them on the actual machine.

---

# 82. IMPORTANT DEVELOPMENT RULE

DO NOT start by building the beautiful UI.

First prove the inference pipeline.

Milestone 1:

person + garment
→ realistic VTON result

Milestone 2:

accurate garment extraction

Milestone 3:

identity preservation

Milestone 4:

sleeve/body reconstruction

Milestone 5:

refinement

Milestone 6:

quality scoring

Milestone 7:

API

Milestone 8:

UI

Milestone 9:

performance optimization

Milestone 10:

packaging

---

# 83. DEVELOPMENT PROCESS

Before writing major code:

1. Inspect all available models.
2. Verify licenses.
3. Verify CUDA compatibility.
4. Verify RTX 4060 memory requirements.
5. Build minimal FASHN inference script.
6. Test real person + real garment.
7. Measure VRAM.
8. Measure speed.
9. Inspect artifacts.
10. Only then build the full architecture.

Do NOT blindly install 50 packages.

Do NOT blindly clone multiple repositories.

Keep dependencies minimal.

---

# 84. CRITICAL QUALITY REQUIREMENT

Never consider the project complete simply because:

"the model generated an image."

The output must be evaluated visually.

Check:

- Did the original shirt actually disappear?
- Did the target garment actually appear?
- Are sleeves correct?
- Are arms reconstructed correctly?
- Is the face unchanged?
- Are hands unchanged?
- Is the body shape preserved?
- Is the background unchanged?
- Is the garment perspective correct?
- Does the fabric follow the body?
- Are logos preserved?
- Are edges clean?
- Are there hallucinated limbs?
- Are there duplicate arms?
- Does the garment look physically plausible?

---

# 85. IMPORTANT DIFFERENCE

The application must understand that:

"shirt → T-shirt"

means:

GARMENT STRUCTURE CHANGE

not:

COLOR CHANGE.

Therefore the model must be allowed to remove:

- collar
- long sleeves
- buttons
- shirt placket

and generate:

- T-shirt neckline
- short sleeves
- appropriate hem
- exposed forearms

while preserving everything else.

---

# 86. PROMPT EXAMPLES

Include examples in the UI:

### Basic

"Replace the shirt with the uploaded T-shirt."

### Fit

"Make the T-shirt slightly oversized."

### Sleeve

"Make the sleeves end just above the elbow."

### Style

"Use a relaxed streetwear fit."

### Preservation

"Keep the face, hair, body, accessories and background unchanged."

### Combined

"Replace the formal shirt with the uploaded oversized black T-shirt. Preserve the exact graphic, make the sleeves naturally short, expose the forearms where appropriate, preserve the person's face, hairstyle, body proportions, hands and background, and match the original lighting."

---

# 87. ADVANCED PROMPT INTERPRETATION

Create a garment instruction schema.

Example:

{
  "category": "tops",
  "type": "tshirt",
  "fit": "oversized",
  "sleeve_length": "short",
  "length": "regular",
  "tuck": "untucked",
  "material": "cotton",
  "preserve_graphics": true,
  "preserve_identity": true,
  "preserve_background": true,
  "lighting": "match_original"
}

Use this to control the pipeline.

---

# 88. UI RESULT INFORMATION

After generation show:

Model:
FASHN VTON v1.5

Mode:
Balanced

Steps:
30

Seed:
xxxxxx

Processing:
x.x sec

Resolution:
xxxx × xxxx

Do not expose unnecessary technical information by default.

Put it under:

Advanced Details.

---

# 89. OUTPUT OPTIONS

Provide:

Download PNG

Download JPG

Download original resolution

Download generated resolution

Copy image

Regenerate

Edit further

---

# 90. FUTURE VIDEO SUPPORT

Architect the code so video can eventually be added.

Do NOT implement video initially unless the image pipeline is stable.

Future:

video upload
+
garment
→ temporal-consistent virtual try-on.

Do not attempt frame-by-frame independent image generation because it will flicker.

---

# 91. FUTURE 3D / GARMENT DIGITIZATION

Keep the architecture extensible for future:

2D garment → 3D garment

fashion catalog

virtual wardrobe

avatar try-on

outfit combinations

But do not over-engineer the first release.

---

# 92. DATABASE

For local-first version, SQLite is enough.

Store:

projects
images
garments
generations
settings
seeds
model configurations

Do not require PostgreSQL for a single-user local application.

---

# 93. FILE MANAGEMENT

Use:

data/
  uploads/
  garments/
  processed/
  outputs/
  cache/

Use generated UUIDs.

Never trust uploaded filenames.

Prevent path traversal.

---

# 94. SECURITY

Validate:

file extension
MIME type
image dimensions
maximum file size

Reject malicious/non-image files.

Never execute uploaded files.

---

# 95. PRIVACY

Provide:

Delete project

Delete source images

Delete outputs

Clear cache

Clear all temporary files

Local-first should mean images do not leave the machine.

---

# 96. DOCUMENTATION

Create:

README.md

ARCHITECTURE.md

INSTALLATION.md

TROUBLESHOOTING.md

MODEL_LICENSES.md

PERFORMANCE.md

API.md

---

# 97. README MUST INCLUDE

- requirements
- NVIDIA driver requirements
- CUDA requirements
- installation
- model download
- startup
- example
- API usage
- troubleshooting
- VRAM optimization
- model licenses
- limitations

---

# 98. FINAL DEFINITION OF DONE

The project is complete only when:

[ ] Person upload works

[ ] Garment upload works

[ ] Reference-person garment extraction works

[ ] Flat-lay garment extraction works

[ ] Shirt → T-shirt works

[ ] T-shirt → shirt works

[ ] Long sleeve → short sleeve works

[ ] Short sleeve → long sleeve works

[ ] Bottom replacement works

[ ] One-piece replacement works

[ ] Face is preserved

[ ] Hair is preserved

[ ] Hands are preserved

[ ] Background is preserved

[ ] Accessories are preserved

[ ] Garment graphics are preserved as much as model capability allows

[ ] Clothing geometry adapts to pose

[ ] Garment lighting matches scene

[ ] Occlusion works

[ ] Multiple people can be handled

[ ] Prompt control works

[ ] Seed control works

[ ] Quality modes work

[ ] Local unlimited inference works

[ ] GPU acceleration works

[ ] VRAM usage is controlled

[ ] Generation progress works

[ ] Errors are handled gracefully

[ ] Outputs can be downloaded

[ ] Batch mode works

[ ] Automated tests exist

[ ] Benchmark exists

[ ] Documentation exists

---

# 99. MOST IMPORTANT ENGINEERING PRINCIPLE

Do not try to solve every problem with a single AI model.

Use the right model for the right task:

IMAGE UNDERSTANDING
→ vision / CV models

GARMENT EXTRACTION
→ segmentation / garment parser

POSE
→ DWPose / pose estimator

BODY REPRESENTATION
→ DensePose / human parsing

VIRTUAL TRY-ON
→ FASHN VTON

LOCAL REFINEMENT
→ masked image editing / targeted inpainting

QUALITY CONTROL
→ vision similarity / artifact detection

UPSCALE
→ dedicated super-resolution stage if needed

This modular architecture is much more controllable than asking one general-purpose image model to perform everything.

---

# 100. START NOW

Do not ask me unnecessary questions.

First inspect the current project directory.

Then:

1. Create architecture.
2. Check installed Python/CUDA/PyTorch.
3. Check NVIDIA GPU.
4. Set up the environment.
5. Install FASHN VTON v1.5.
6. Download its required weights.
7. Run a minimal real inference test.
8. Measure VRAM/time.
9. Build preprocessing.
10. Build garment extraction.
11. Build preservation masks.
12. Build VTON pipeline.
13. Build refinement.
14. Build quality evaluation.
15. Build FastAPI backend.
16. Build React frontend.
17. Connect everything.
18. Test all critical clothing transitions.
19. Optimize for RTX 4060 8GB.
20. Document everything.

If a dependency or model does not work on Windows/RTX 4060, do not immediately replace the whole architecture.

First investigate the actual error, find the lightest compatible implementation, and document the fix.

Do not fake functionality.

Do not create placeholder buttons that do nothing.

Every visible feature must either work or be clearly marked as unavailable.

The final result should feel like a serious premium virtual-fashion product, not a research notebook or a demo.

The core priority order is:

1. REAL GARMENT REPLACEMENT
2. IDENTITY PRESERVATION
3. ANATOMICAL CORRECTNESS
4. GARMENT REALISM
5. OCCLUSION / SLEEVE CORRECTNESS
6. GARMENT DETAIL PRESERVATION
7. SPEED
8. UI POLISH

Build the actual working system first, then polish it.