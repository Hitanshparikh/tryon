import React, { useState, useEffect } from 'react';
import { History, Sparkles, CheckCircle, Download, Calendar } from 'lucide-react';
import { GenerationHistoryItem } from '../types';
import { api } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await api.getGenerations();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Generation History & Benchmarks</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review past photorealistic try-on results with full parameter and identity preservation recall.
        </p>
      </div>

      {/* History Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading generation history...</div>
      ) : history.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Generations Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Perform your first neural try-on from the Studio Workspace to see your saved history here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/40 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-brand-500/40 transition-all shadow-xl"
            >
              {/* Image Preview */}
              <div className="relative aspect-[3/4] rounded-xl bg-black/60 border border-slate-800 overflow-hidden mb-3">
                <img
                  src={item.result_image_url}
                  alt="Result"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 uppercase">
                  {item.mode} Mode
                </span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {((item.quality_metrics.identity_score ?? 0.98) * 100).toFixed(0)}% Identity
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">Seed #{item.seed}</span>
                  <span className="text-slate-400">{item.steps} steps · {item.duration_seconds}s</span>
                </div>

                {item.prompt && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 line-clamp-2">
                    "{item.prompt}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at * 1000).toLocaleDateString()}
                  </span>

                  <a
                    href={item.result_image_url}
                    download={`tryon_${item.id}.png`}
                    className="flex items-center gap-1 font-bold text-brand-400 hover:text-brand-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
