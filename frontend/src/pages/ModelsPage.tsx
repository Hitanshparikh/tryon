import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, CheckCircle2, ShieldCheck, Zap, Server } from 'lucide-react';
import { HardwareStatus, ModelItem } from '../types';
import { api } from '../services/api';

export const ModelsPage: React.FC = () => {
  const [hardware, setHardware] = useState<HardwareStatus | null>(null);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getModels();
        setHardware(data.hardware);
        setModels(data.models);
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Hardware & AI Engine Manager</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time VRAM telemetry, CUDA device management, and modular try-on model status.
        </p>
      </div>

      {/* Hardware Telemetry Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* GPU Device */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compute Device</span>
              <h3 className="font-extrabold text-sm text-slate-100">{hardware?.device_name || 'NVIDIA RTX 4060'}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CUDA 12.4 Acceleration Active
          </div>
        </div>

        {/* VRAM Allocation Meter */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">VRAM Utilization</span>
              <h3 className="font-extrabold text-sm text-slate-100">
                {hardware?.vram_allocated_gb ?? 0.0} / {hardware?.vram_total_gb ?? 8.0} GB
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, hardware?.vram_percent ?? 15)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block text-right font-mono">
              {hardware?.vram_percent ?? 15}% in use
            </span>
          </div>
        </div>

        {/* Local Unlimited Status */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Deployment Mode</span>
              <h3 className="font-extrabold text-sm text-slate-100">100% Offline & Unlimited</h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Zero cloud compute quotas. All inference executes directly on local RTX 4060 silicon.
          </p>
        </div>

      </div>

      {/* Model Registry Table */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Installed AI Engines & Models</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Modular Architecture</span>
        </div>

        <div className="divide-y divide-slate-800">
          {models.map((model) => (
            <div key={model.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl mt-0.5 ${model.primary ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">{model.name}</h4>
                    {model.primary && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold border border-brand-500/30">
                        Primary Engine
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">License: {model.license}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">VRAM Footprint</span>
                  <span className="text-xs font-bold text-slate-200">{model.vram_usage}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {model.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
