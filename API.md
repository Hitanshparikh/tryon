# API Documentation

The AI Virtual Try-On Studio exposes clean, high-performance REST endpoints with asynchronous background job tracking.

Base URL: `http://localhost:8000`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Analysis Endpoints

### `POST /api/analyze-person`
Analyzes a person photograph, detecting faces, pose keypoints, sleeve lengths, and generating protection masks.

**Form Data:**
- `image`: Multipart file (JPG, PNG, WEBP)
- `selected_idx`: Integer index for multi-person target selection (default: 0)

**Response:**
```json
{
  "id": "uuid-v4",
  "person_count": 1,
  "selected_person_idx": 0,
  "bounding_box": [120, 45, 340, 310],
  "pose_detected": true,
  "detected_sleeve_type": "long",
  "confidence": 0.98
}
```

---

### `POST /api/analyze-garment`
Extracts garment silhouette, removes foreign backgrounds/identities, and analyzes sleeve and neckline geometry.

**Form Data:**
- `image`: Multipart file
- `is_reference_person`: Boolean (true if garment is worn by another person)
- `category_hint`: String (optional: `tops`, `bottoms`, `one-pieces`)

---

## 2. Try-On & Generation Endpoints

### `POST /api/try-on`
Submits a virtual try-on generation job.

**Form Data:**
- `person_image`: Multipart file
- `garment_image`: Multipart file
- `category`: `tops` | `bottoms` | `one-pieces`
- `mode`: `fast` | `balanced` | `quality`
- `steps`: Integer (default: 30)
- `seed`: Integer (optional)
- `prompt`: String (optional structured instructions)

**Response:**
```json
{
  "job_id": "c9a28e51-...",
  "status": "queued"
}
```

---

### `GET /api/job/{job_id}`
Polls generation progress (0% to 100%) and retrieves result URLs and quality metrics upon completion.

---

## 3. Wardrobe & Model Management

- `GET /api/wardrobe`: Returns saved garment items.
- `POST /api/wardrobe/upload`: Saves an extracted garment into the persistent wardrobe library.
- `DELETE /api/wardrobe/{id}`: Deletes a garment from the library.
- `GET /api/models`: Returns GPU device telemetry, VRAM usage, and model installation status.
