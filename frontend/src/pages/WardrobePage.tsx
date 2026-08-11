import React, { useState, useEffect, useRef } from 'react';
import { Shirt, Plus, Trash2, Tag, ArrowRight, Upload } from 'lucide-react';
import { GarmentAsset } from '../types';
import { api } from '../services/api';

interface WardrobePageProps {
  onSelectGarmentForTryOn: (asset: GarmentAsset) => void;
}

export const WardrobePage: React.FC<WardrobePageProps> = ({ onSelectGarmentForTryOn }) => {
  const [wardrobe, setWardrobe] = useState<GarmentAsset[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWardrobe = async () => {
    try {
      setIsLoading(true);
      const items = await api.getWardrobe(categoryFilter === 'all' ? undefined : categoryFilter);
      setWardrobe(items);
    } catch (err) {
      console.error('Failed to fetch wardrobe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWardrobe();
  }, [categoryFilter]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        await api.uploadToWardrobe(file, file.name.split('.')[0]);
        fetchWardrobe();
      } catch (err: any) {
        alert(`Failed to add garment: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWardrobeItem(id);
      setWardrobe(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Virtual Wardrobe Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">
            Store and manage isolated garment assets for reuse across any person model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Garment
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'tops', 'bottoms', 'one-pieces'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
              categoryFilter === cat
                ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading wardrobe library...</div>
      ) : wardrobe.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Garments in Wardrobe</h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload your first flat-lay or product apparel item to start building your collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wardrobe.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-brand-500/50 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 flex flex-col justify-between"
            >
              {/* Garment Preview */}
              <div className="relative aspect-square rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center p-4 overflow-hidden mb-3">
                <img
                  src={item.transparent_path}
                  alt={item.name}
                  className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Sleeve Badge */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10 uppercase">
                  {item.sleeve_type}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600/80 text-slate-400 hover:text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Metadata */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{item.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                    {item.category}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{item.has_graphics ? 'With Artwork' : 'Plain Fabric'}</span>
                  {item.dominant_colors[0] && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: item.dominant_colors[0] }}
                    />
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectGarmentForTryOn(item)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow border border-slate-700 hover:border-brand-500"
              >
                <span>Try On Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
