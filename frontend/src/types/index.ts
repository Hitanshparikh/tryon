export interface QualityMetrics {
  identity_score: number;
  garment_score: number;
  anatomy_score: number;
  preservation_score: number;
  overall_confidence: number;
  retries_performed: number;
}

export interface GarmentAsset {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  sleeve_type: string;
  dominant_colors: string[];
  has_graphics: boolean;
  original_path: string;
  transparent_path: string;
  mask_path?: string;
  confidence: number;
}

export interface PersonAnalysisResult {
  id: string;
  person_count: number;
  selected_person_idx: number;
  bounding_box: number[];
  pose_detected: boolean;
  has_upper_body: boolean;
  has_lower_body: boolean;
  detected_sleeve_type: string;
  face_protection_mask_path?: string;
  hair_protection_mask_path?: string;
  hands_protection_mask_path?: string;
  background_protection_mask_path?: string;
  garment_region_mask_path?: string;
  confidence: number;
}

export interface TryOnJob {
  id: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  result?: {
    job_id: string;
    result_image_url: string;
    comparison_image_url?: string;
    category: string;
    mode: string;
    steps: number;
    seed: number;
    duration_seconds: number;
    quality_metrics: QualityMetrics;
    model_name: string;
  };
  error?: string;
}

export interface GenerationHistoryItem {
  id: string;
  result_image_url: string;
  comparison_image_url?: string;
  category: string;
  mode: string;
  steps: number;
  seed: number;
  prompt?: string;
  quality_metrics: QualityMetrics;
  duration_seconds: number;
  created_at: number;
}

export interface HardwareStatus {
  cuda_available: boolean;
  device_name: string;
  vram_allocated_gb: number;
  vram_reserved_gb: number;
  vram_total_gb: number;
  vram_percent: number;
}

export interface ModelItem {
  id: string;
  name: string;
  license: string;
  status: string;
  vram_usage: string;
  primary: boolean;
}
