
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import TuneLibrary from './components/TuneLibrary.tsx';
import PracticeMode from './components/PracticeMode.tsx';
import StudyMode from './components/StudyMode.tsx';
import PracticeLog from './components/PracticeLog.tsx';
import { AppMode, Tune, Transposition } from './types.ts';
import { INITIAL_TUNES } from './constants.ts';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.LIBRARY);
  const [transposition, setTransposition] = useState<Transposition>('C');
  const [tunes, setTunes] = useState<Tune[]>(INITIAL_TUNES);
  const [selectedTuneId, setSelectedTuneId] = useState<string | undefined>(INITIAL_TUNES[0].id);

  // Expose navigation to window for deep components (e.g. Study Room button)
  useEffect(() => {
    (window as any).setActiveMode = (mode: AppMode) => setActiveMode(mode);
  }, []);

  const activeTune = tunes.find(t => t.id === selectedTuneId) || tunes[0];

  const handleTuneSelect = (tune: Tune, targetMode?: 'PRACTICE' | 'STUDY') => {
    setSelectedTuneId(tune.id);
    if (targetMode === 'STUDY') {
      setActiveMode(AppMode.STUDY);
    } else {
      setActiveMode(AppMode.PRACTICE);
    }
  };

  const updateTuneMastery = (tuneId: string, mastery: Tune['mastery']) => {
    setTunes(prev => prev.map(t => t.id === tuneId ? { ...t, mastery } : t));
  };

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.LIBRARY:
        return (
          <TuneLibrary 
            tunes={tunes} 
            onSelect={handleTuneSelect} 
            onUpdateMastery={updateTuneMastery}
            selectedTuneId={selectedTuneId} 
          />
        );
      case AppMode.PRACTICE:
        return <PracticeMode tune={activeTune} transposition={transposition} />;
      case AppMode.STUDY:
        return (
          <StudyMode 
            tunes={tunes} 
            transposition={transposition} 
            selectedTuneId={selectedTuneId}
            onTuneSelect={(id) => setSelectedTuneId(id)}
          />
        );
      case AppMode.LOG:
        return <PracticeLog />;
      default:
        return <TuneLibrary tunes={tunes} onSelect={handleTuneSelect} onUpdateMastery={updateTuneMastery} />;
    }
  };

  return (
    <Layout 
      activeMode={activeMode} 
      setActiveMode={setActiveMode} 
      transposition={transposition} 
      setTransposition={setTransposition}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
