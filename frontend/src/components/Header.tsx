import React from 'react';
import { Sparkles, Layers, Shirt, History, Cpu, ShieldCheck } from 'lucide-react';
import { HardwareStatus } from '../types';

interface HeaderProps {
  activeTab: 'studio' | 'wardrobe' | 'history' | 'models';
  setActiveTab: (tab: 'studio' | 'wardrobe' | 'history' | 'models') => void;
  hardware?: HardwareStatus;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, hardware }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FASHN AI STUDIO
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                v1.5 PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Neural Photorealistic Try-On</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Studio Workspace
          </button>

          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Wardrobe
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'models'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Models & GPU
          </button>
        </nav>

        {/* System & Hardware Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Unlimited</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-right">
              <span className="font-semibold text-slate-200 block leading-tight">
                {hardware?.device_name || 'NVIDIA RTX 4060'}
              </span>
              <span className="text-[10px] text-slate-400">
                {hardware?.vram_allocated_gb ?? 0.0} / {hardware?.vram_total_gb ?? 8.0} GB VRAM
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
