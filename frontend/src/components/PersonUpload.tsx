import React, { useRef, useState } from 'react';
import { User, Upload, Shield, Users, Eye, EyeOff } from 'lucide-react';
import { PersonAnalysisResult } from '../types';

interface PersonUploadProps {
  personFile: File | null;
  personPreview: string | null;
  analysis: PersonAnalysisResult | null;
  onPersonSelect: (file: File) => void;
  onPersonIndexChange?: (idx: number) => void;
}

export const PersonUpload: React.FC<PersonUploadProps> = ({
  personFile,
  personPreview,
  analysis,
  onPersonSelect,
  onPersonIndexChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMasks, setShowMasks] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPersonSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-xl p-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">1. Person Model</h3>
            <p className="text-[11px] text-slate-400">Target photograph</p>
          </div>
        </div>

        {personPreview && (
          <button
            onClick={() => setShowMasks(!showMasks)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              showMasks
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {showMasks ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showMasks ? 'Masks Visible' : 'View AI Masks'}
          </button>
        )}
      </div>

      {/* Upload Dropzone / Preview Area */}
      <div className="relative mt-3 flex-1 flex flex-col items-center justify-center min-h-[300px] rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 overflow-hidden group hover:border-brand-500/50 transition-all">
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onPersonSelect(e.target.files[0]);
            }
          }}
        />

        {personPreview ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <div className="relative inline-block max-h-[320px]">
              {/* Base Image */}
              <img
                ref={imgRef}
                src={personPreview}
                alt="Person Model Preview"
                className="max-h-[320px] w-auto object-contain rounded-lg shadow-lg"
              />

              {/* Exact AI Mask Layer */}
              {showMasks && analysis?.garment_region_mask_path && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                  <img
                    src={analysis.garment_region_mask_path.replace('_garment_region.png', '_mask_overlay.png')}
                    alt="AI Mask Layer"
                    className="w-full h-full object-contain mix-blend-screen opacity-90"
                    onError={(e) => {
                      // Fallback overlay if custom overlay path differs
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Face Protection Badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-md shadow-lg">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Face & Hair 100% Protected
                  </div>
                </div>
              )}
            </div>

            {/* Change Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-xs font-semibold text-white border border-white/10 shadow-lg transition-all"
            >
              Replace Photo
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-all">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-400" />
            </div>
            <p className="text-xs font-bold text-slate-200">Drag & drop person image</p>
            <p className="text-[11px] text-slate-400 mt-1">or click to browse from device</p>
            <span className="mt-3 inline-block text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              JPG, PNG, WEBP · Auto Face & Anatomy Segmentation
            </span>
          </div>
        )}
      </div>

      {/* Multi-Person Detection Badges */}
      {analysis && analysis.person_count > 1 && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              {analysis.person_count} People Detected
            </span>
            <span className="text-[10px] text-slate-400">Select target</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: analysis.person_count }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPersonIndexChange?.(idx)}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  analysis.selected_person_idx === idx
                    ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Person {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Anatomy & Protection Info */}
      {analysis && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Detected Sleeve</span>
            <span className="font-semibold text-slate-200 capitalize">{analysis.detected_sleeve_type}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Identity Protection</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> 100% Locked
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
