import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudioPage } from './pages/StudioPage';
import { WardrobePage } from './pages/WardrobePage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelsPage } from './pages/ModelsPage';
import { HardwareStatus, GarmentAsset } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'wardrobe' | 'history' | 'models'>('studio');
  const [hardware, setHardware] = useState<HardwareStatus | undefined>(undefined);

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const data = await api.getModels();
        setHardware(data.hardware);
      } catch (err) {
        console.error('Failed to load hardware status:', err);
      }
    };
    fetchHardware();
    const interval = setInterval(fetchHardware, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectGarmentFromWardrobe = (asset: GarmentAsset) => {
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hardware={hardware}
      />

      <main className="flex-1">
        {activeTab === 'studio' && <StudioPage onOpenWardrobe={() => setActiveTab('wardrobe')} />}
        {activeTab === 'wardrobe' && <WardrobePage onSelectGarmentForTryOn={handleSelectGarmentFromWardrobe} />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'models' && <ModelsPage />}
      </main>
    </div>
  );
};

export default App;
