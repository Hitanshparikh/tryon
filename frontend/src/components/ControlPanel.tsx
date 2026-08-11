import React from 'react';
import { Sliders, Sparkles, Wand2, Dices, RefreshCw, Paintbrush, CheckCircle } from 'lucide-react';

interface ControlPanelProps {
  mode: string;
  setMode: (mode: string) => void;
  steps: number;
  setSteps: (steps: number) => void;
  fit: string;
  setFit: (fit: string) => void;
  sleeveOverride: string;
  setSleeveOverride: (sleeve: string) => void;
  seed: number;
  setSeed: (seed: number) => void;
  isRandomSeed: boolean;
  setIsRandomSeed: (val: boolean) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onOpenMaskEditor?: () => void;
  hasCustomMask?: boolean;
  onClearCustomMask?: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  steps,
  setSteps,
  fit,
  setFit,
  sleeveOverride,
  setSleeveOverride,
  seed,
  setSeed,
  isRandomSeed,
  setIsRandomSeed,
  prompt,
  setPrompt,
  onOpenMaskEditor,
  hasCustomMask,
  onClearCustomMask,
  onGenerate,
  isGenerating,
  canGenerate
}) => {
  const samplePrompts = [
    'Make the T-shirt slightly oversized',
    'Short sleeves with relaxed streetwear fit',
    'Keep exact graphics, match scene lighting',
    'Untucked shirt with natural arm drape'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-xl p-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">3. Generation Controls</h3>
          <p className="text-[11px] text-slate-400">Neural parameters & fit</p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        
        {/* Quality Mode Presets */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
            Engine Mode & Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'fast', label: 'Fast', steps: 20, desc: '20 steps' },
              { id: 'balanced', label: 'Balanced', steps: 30, desc: '30 steps' },
              { id: 'quality', label: 'Quality', steps: 45, desc: '45 steps' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setMode(p.id);
                  setSteps(p.steps);
                }}
                className={`p-2 rounded-xl text-center border transition-all ${
                  mode === p.id
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] opacity-80">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selective Inpainting Brush Button */}
        {onOpenMaskEditor && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Selective Brush Mask</span>
                <span className="text-[10px] text-slate-400">
                  {hasCustomMask ? 'Custom mask applied' : 'Paint custom edit region'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {hasCustomMask && (
                <button
                  onClick={onClearCustomMask}
                  className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20"
                >
                  Reset
                </button>
              )}
              <button
                onClick={onOpenMaskEditor}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-600 to-brand-600 text-white shadow"
              >
                {hasCustomMask ? 'Edit Mask' : 'Paint Mask'}
              </button>
            </div>
          </div>
        )}

        {/* Garment Fit */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
            Garment Fit & Silhouette
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {['regular', 'oversized', 'slim', 'relaxed'].map((f) => (
              <button
                key={f}
                onClick={() => setFit(f)}
                className={`py-1.5 text-[11px] font-semibold rounded-lg border capitalize transition-all ${
                  fit === f
                    ? 'bg-slate-800 border-brand-500 text-brand-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sleeve Geometry Adjustment */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
            Sleeve Geometry
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'auto', label: 'Auto Detect' },
              { id: 'short', label: 'Short Sleeves' },
              { id: 'long', label: 'Long Sleeves' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSleeveOverride(s.id)}
                className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                  sleeveOverride === s.id
                    ? 'bg-slate-800 border-brand-500 text-brand-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Language Prompt Box */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between mb-1.5">
            <span className="uppercase tracking-wider flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-brand-400" />
              Prompt Interpreter
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Replace shirt with oversized black graphic tee, preserve face and lighting"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all resize-none"
          />

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(sp)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all text-left"
              >
                + {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Seed Reproducibility */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Seed Reproducibility
            </label>
            <button
              onClick={() => {
                setIsRandomSeed(!isRandomSeed);
                if (isRandomSeed) setSeed(Math.floor(Math.random() * 1000000));
              }}
              className="text-[10px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <Dices className="w-3 h-3" />
              {isRandomSeed ? 'Randomized' : 'Fixed'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seed}
              disabled={isRandomSeed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 disabled:opacity-50"
            />
            <button
              onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
              disabled={isRandomSeed}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50"
              title="Roll new seed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Generate Button */}
      <div className="pt-3 border-t border-slate-800 mt-2">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl transition-all ${
            canGenerate && !isGenerating
              ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white shadow-brand-500/25 cursor-pointer active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              Running Neural Try-On...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Photorealistic Try-On
            </>
          )}
        </button>
      </div>

    </div>
  );
};
