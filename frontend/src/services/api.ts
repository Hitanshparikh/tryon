import { GarmentAsset, PersonAnalysisResult, TryOnJob, GenerationHistoryItem, HardwareStatus, ModelItem } from '../types';

const API_BASE = '';

export const api = {
  // Analyze Person
  async analyzePerson(file: File, selectedIdx: number = 0): Promise<PersonAnalysisResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('selected_idx', selectedIdx.toString());

    const res = await fetch(`${API_BASE}/api/analyze-person`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Analyze Garment
  async analyzeGarment(file: File, isReference: boolean = false, categoryHint?: string): Promise<GarmentAsset> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_reference_person', isReference ? 'true' : 'false');
    if (categoryHint) formData.append('category_hint', categoryHint);

    const res = await fetch(`${API_BASE}/api/analyze-garment`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Start Try-On
  async startTryOn(params: {
    personFile: File;
    garmentFile: File;
    category: string;
    mode: string;
    steps: number;
    seed?: number;
    prompt?: string;
    selectiveMask?: File;
  }): Promise<{ job_id: string; status: string }> {
    const formData = new FormData();
    formData.append('person_image', params.personFile);
    formData.append('garment_image', params.garmentFile);
    formData.append('category', params.category);
    formData.append('mode', params.mode);
    formData.append('steps', params.steps.toString());
    if (params.seed !== undefined) formData.append('seed', params.seed.toString());
    if (params.prompt) formData.append('prompt', params.prompt);
    if (params.selectiveMask) formData.append('selective_mask', params.selectiveMask);

    const res = await fetch(`${API_BASE}/api/try-on`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Poll Job Status
  async getJob(jobId: string): Promise<TryOnJob> {
    const res = await fetch(`${API_BASE}/api/job/${jobId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Wardrobe List
  async getWardrobe(category?: string): Promise<GarmentAsset[]> {
    const url = category ? `${API_BASE}/api/wardrobe?category=${category}` : `${API_BASE}/api/wardrobe`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Wardrobe Upload
  async uploadToWardrobe(file: File, name?: string, categoryHint?: string): Promise<GarmentAsset> {
    const formData = new FormData();
    formData.append('image', file);
    if (name) formData.append('name', name);
    if (categoryHint) formData.append('category_hint', categoryHint);

    const res = await fetch(`${API_BASE}/api/wardrobe/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Delete Wardrobe Item
  async deleteWardrobeItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/wardrobe/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // Generation History
  async getGenerations(): Promise<GenerationHistoryItem[]> {
    const res = await fetch(`${API_BASE}/api/generations`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Models & Hardware
  async getModels(): Promise<{ hardware: HardwareStatus; models: ModelItem[] }> {
    const res = await fetch(`${API_BASE}/api/models`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
