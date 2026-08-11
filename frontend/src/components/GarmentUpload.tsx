import React, { useRef, useState } from 'react';
import { Shirt, Upload, Sparkles, Palette, Tag, Eye, EyeOff } from 'lucide-react';
import { GarmentAsset } from '../types';

interface GarmentUploadProps {
  garmentFile: File | null;
  garmentPreview: string | null;
  garmentAsset: GarmentAsset | null;
  category: string;
  onCategoryChange: (cat: string) => void;
  onGarmentSelect: (file: File, isRef: boolean) => void;
  onOpenWardrobe?: () => void;
}

export const GarmentUpload: React.FC<GarmentUploadProps> = ({
  garmentFile,
  garmentPreview,
  garmentAsset,
  category,
  onCategoryChange,
  onGarmentSelect,
  onOpenWardrobe
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'reference'>('upload');
  const [showCutout, setShowCutout] = useState<boolean>(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onGarmentSelect(e.dataTransfer.files[0], mode === 'reference');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-xl p-4 shadow-xl">
      
      {/* Header & Mode Switcher */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">2. Target Garment</h3>
              <p className="text-[11px] text-slate-400">Apparel replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {garmentAsset?.transparent_path && (
              <button
                onClick={() => setShowCutout(!showCutout)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  showCutout
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {showCutout ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showCutout ? 'Cutout View' : 'View Cutout'}
              </button>
            )}

            {onOpenWardrobe && (
              <button
                onClick={onOpenWardrobe}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                Wardrobe
              </button>
            )}
          </div>
        </div>

        {/* Upload Mode Switch */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-slate-950/60 border border-slate-800">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
              mode === 'upload' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flat-Lay / Product
          </button>
          <button
            onClick={() => setMode('reference')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
              mode === 'reference' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Garment on Model
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-3 flex gap-1.5">
        {[
          { id: 'tops', label: 'Tops (Shirts/Suits/Jackets)' },
          { id: 'bottoms', label: 'Bottoms (Jeans/Pants)' },
          { id: 'one-pieces', label: 'One-Pieces (Dresses)' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
              category === cat.id
                ? 'bg-slate-800 border-brand-500/80 text-brand-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.id.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dropzone & Preview */}
      <div className="relative mt-3 flex-1 flex flex-col items-center justify-center min-h-[300px] rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 overflow-hidden group hover:border-brand-500/50 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onGarmentSelect(e.target.files[0], mode === 'reference');
            }
          }}
        />

        {garmentPreview ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img
              src={showCutout && garmentAsset?.transparent_path ? garmentAsset.transparent_path : garmentPreview}
              alt="Garment Preview"
              className="max-h-[320px] w-auto object-contain rounded-lg shadow-lg"
            />

            {/* Change Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-xs font-semibold text-white border border-white/10 shadow-lg transition-all"
            >
              Replace Garment
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
            <p className="text-xs font-bold text-slate-200">
              {mode === 'upload' ? 'Upload garment photo' : 'Upload reference photo with garment'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {mode === 'upload' ? 'Flat-lay, ghost mannequin, e-comm' : 'Auto isolates garment without person head or background'}
            </p>
            <span className="mt-3 inline-block text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Auto Background Removal & Garment Isolation
            </span>
          </div>
        )}
      </div>

      {/* Extracted Garment Properties */}
      {garmentAsset && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Sleeve</span>
            <span className="font-semibold text-slate-200 capitalize">{garmentAsset.sleeve_type}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Category</span>
            <span className="font-semibold text-slate-200 capitalize">{garmentAsset.sub_category || garmentAsset.category}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[10px]">Palette</span>
            <div className="flex gap-1">
              {garmentAsset.dominant_colors.slice(0, 2).map((col, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: col }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
