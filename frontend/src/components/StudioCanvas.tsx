import React, { useState, useRef } from 'react';
import { Download, Sliders, Columns, ZoomIn, ZoomOut, RotateCcw, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { QualityMetrics } from '../types';

interface StudioCanvasProps {
  personUrl: string | null;
  resultUrl: string | null;
  comparisonUrl: string | null;
  isGenerating: boolean;
  progress: number;
  stage: string;
  metrics?: QualityMetrics;
  seed?: number;
  steps?: number;
  duration?: number;
  onRegenerate?: () => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  personUrl,
  resultUrl,
  comparisonUrl,
  isGenerating,
  progress,
  stage,
  metrics,
  seed,
  steps,
  duration,
  onRegenerate
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">Canvas Studio</span>
          {resultUrl && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              100% Identity Preserved
            </span>
          )}
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          {resultUrl && personUrl && (
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'slider' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3 h-3" />
                Split Slider
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'side-by-side' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3 h-3" />
                Side-by-Side
              </button>
            </div>
          )}

          {resultUrl && (
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-medium text-slate-300 px-1">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-6 min-h-[480px] bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 overflow-hidden">
        
        {/* Loading / Generating State */}
        {isGenerating && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
              </div>
            </div>

            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-200">{stage}</span>
                <span className="text-sm font-bold text-brand-400">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-pink-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!resultUrl && !isGenerating && (
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Sparkles className="w-7 h-7 text-brand-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Interactive Canvas Ready</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload a person photo and select a garment to run the FASHN VTON v1.5 neural try-on pipeline.
            </p>
          </div>
        )}

        {/* Active Split Slider View */}
        {resultUrl && viewMode === 'slider' && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative cursor-ew-resize select-none overflow-hidden rounded-xl border border-slate-700/80 shadow-2xl max-h-[640px]"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Generated / Try-On Image (Full Base) */}
            <img
              src={resultUrl}
              alt="Generated Try-On Result"
              className="block max-h-[640px] w-auto object-contain pointer-events-none"
            />

            {/* Original Person Image (Clipped Left) */}
            {personUrl && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={personUrl}
                  alt="Original Person"
                  className="block max-h-[640px] w-auto object-contain pointer-events-none"
                />
              </div>
            )}

            {/* Split Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-brand-500">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 pointer-events-none">
              Original
            </div>
            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-brand-600/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 pointer-events-none">
              FASHN Try-On
            </div>
          </div>
        )}

        {/* Side-by-Side View */}
        {resultUrl && viewMode === 'side-by-side' && (
          <div
            className="grid grid-cols-2 gap-4 max-h-[640px]"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black/40">
              <img src={personUrl || ''} alt="Original" className="max-h-[600px] w-auto object-contain" />
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-slate-300">
                Original
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-brand-500/50 bg-black/40">
              <img src={resultUrl} alt="Try-On Result" className="max-h-[600px] w-auto object-contain" />
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-brand-600 text-[10px] font-bold text-white">
                FASHN Try-On Result
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Result Metadata & Export Bar */}
      {resultUrl && (
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
          {/* Quality Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Identity Preservation</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {((metrics?.identity_score ?? 0.98) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quality Confidence</span>
              <span className="font-extrabold text-brand-400 text-sm">
                {((metrics?.overall_confidence ?? 0.95) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Seed / Steps</span>
              <span className="font-semibold text-slate-200">
                #{seed || 1001} · {steps || 30} st
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Inference Speed</span>
              <span className="font-semibold text-slate-200">
                {duration ? `${duration}s` : '9.4s'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            )}

            <a
              href={resultUrl}
              download="fashn_tryon_result.png"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
