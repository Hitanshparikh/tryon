import React, { useState } from 'react';
import { PersonUpload } from '../components/PersonUpload';
import { GarmentUpload } from '../components/GarmentUpload';
import { ControlPanel } from '../components/ControlPanel';
import { StudioCanvas } from '../components/StudioCanvas';
import { MaskEditorModal } from '../components/MaskEditorModal';
import { PersonAnalysisResult, GarmentAsset, QualityMetrics } from '../types';
import { api } from '../services/api';

interface StudioPageProps {
  onOpenWardrobe: () => void;
}

export const StudioPage: React.FC<StudioPageProps> = ({ onOpenWardrobe }) => {
  // Person state
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [personAnalysis, setPersonAnalysis] = useState<PersonAnalysisResult | null>(null);

  // Garment state
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentAsset, setGarmentAsset] = useState<GarmentAsset | null>(null);
  const [category, setCategory] = useState<string>('tops');

  // Control state
  const [mode, setMode] = useState<string>('balanced');
  const [steps, setSteps] = useState<number>(30);
  const [fit, setFit] = useState<string>('regular');
  const [sleeveOverride, setSleeveOverride] = useState<string>('auto');
  const [seed, setSeed] = useState<number>(1001);
  const [isRandomSeed, setIsRandomSeed] = useState<boolean>(true);
  const [prompt, setPrompt] = useState<string>('');
  
  // Custom Selective Mask
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState<boolean>(false);
  const [customMaskFile, setCustomMaskFile] = useState<File | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('Ready');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [comparisonUrl, setComparisonUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<QualityMetrics | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  // Handle Person Upload
  const handlePersonSelect = async (file: File) => {
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    try {
      const res = await api.analyzePerson(file, 0);
      setPersonAnalysis(res);
    } catch (err) {
      console.error('Person analysis error:', err);
    }
  };

  // Handle Garment Upload
  const handleGarmentSelect = async (file: File, isRef: boolean) => {
    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
    try {
      const asset = await api.analyzeGarment(file, isRef, category);
      setGarmentAsset(asset);
      if (asset.category) setCategory(asset.category);
    } catch (err) {
      console.error('Garment analysis error:', err);
    }
  };

  // Handle Generate Try-On
  const handleGenerate = async () => {
    if (!personFile || !garmentFile) return;

    setIsGenerating(true);
    setProgress(5);
    setStage('Submitting try-on request...');
    setResultUrl(null);

    try {
      const effectiveSeed = isRandomSeed ? Math.floor(Math.random() * 2147483647) : seed;
      
      let fullPrompt = prompt;
      if (fit !== 'regular') fullPrompt = `${fullPrompt} fit: ${fit}`;
      if (sleeveOverride !== 'auto') fullPrompt = `${fullPrompt} sleeve: ${sleeveOverride}`;

      const { job_id } = await api.startTryOn({
        personFile,
        garmentFile,
        category,
        mode,
        steps,
        seed: effectiveSeed,
        prompt: fullPrompt.trim() || undefined,
        selectiveMask: customMaskFile || undefined
      });

      // Poll job progress
      const pollInterval = setInterval(async () => {
        try {
          const job = await api.getJob(job_id);
          setProgress(job.progress);
          setStage(job.stage);

          if (job.status === 'completed' && job.result) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setResultUrl(job.result.result_image_url);
            setComparisonUrl(job.result.comparison_image_url || null);
            setMetrics(job.result.quality_metrics);
            setDuration(job.result.duration_seconds);
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert(`Generation failed: ${job.error || 'Unknown error'}`);
          }
        } catch (pollErr) {
          console.error('Poll error:', pollErr);
        }
      }, 500);

    } catch (err: any) {
      setIsGenerating(false);
      alert(`Error starting try-on: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 3-Column Input & Controls Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Column 1: Person */}
        <PersonUpload
          personFile={personFile}
          personPreview={personPreview}
          analysis={personAnalysis}
          onPersonSelect={handlePersonSelect}
        />

        {/* Column 2: Garment */}
        <GarmentUpload
          garmentFile={garmentFile}
          garmentPreview={garmentPreview}
          garmentAsset={garmentAsset}
          category={category}
          onCategoryChange={setCategory}
          onGarmentSelect={handleGarmentSelect}
          onOpenWardrobe={onOpenWardrobe}
        />

        {/* Column 3: Controls */}
        <ControlPanel
          mode={mode}
          setMode={setMode}
          steps={steps}
          setSteps={setSteps}
          fit={fit}
          setFit={setFit}
          sleeveOverride={sleeveOverride}
          setSleeveOverride={setSleeveOverride}
          seed={seed}
          setSeed={setSeed}
          isRandomSeed={isRandomSeed}
          setIsRandomSeed={setIsRandomSeed}
          prompt={prompt}
          setPrompt={setPrompt}
          onOpenMaskEditor={() => setIsMaskEditorOpen(true)}
          hasCustomMask={!!customMaskFile}
          onClearCustomMask={() => setCustomMaskFile(null)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          canGenerate={!!personFile && !!garmentFile}
        />
      </div>

      {/* Main Interactive Studio Canvas View */}
      <StudioCanvas
        personUrl={personPreview}
        resultUrl={resultUrl}
        comparisonUrl={comparisonUrl}
        isGenerating={isGenerating}
        progress={progress}
        stage={stage}
        metrics={metrics}
        seed={seed}
        steps={steps}
        duration={duration}
        onRegenerate={handleGenerate}
      />

      {/* Selective Mask Brush Editor Modal */}
      <MaskEditorModal
        isOpen={isMaskEditorOpen}
        onClose={() => setIsMaskEditorOpen(false)}
        personUrl={personPreview}
        onSaveMask={(mask) => setCustomMaskFile(mask)}
      />

    </div>
  );
};
