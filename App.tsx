
import React, { useState } from 'react';
import Layout from './components/Layout';
import TuneLibrary from './components/TuneLibrary';
import PracticeMode from './components/PracticeMode';
import StudyMode from './components/StudyMode';
import PracticeLog from './components/PracticeLog';
import { AppMode, Tune, Transposition } from './types';
import { INITIAL_TUNES } from './constants';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.LIBRARY);
  const [transposition, setTransposition] = useState<Transposition>('C');
  const [tunes, setTunes] = useState<Tune[]>(INITIAL_TUNES);
  const [selectedTuneId, setSelectedTuneId] = useState<string | undefined>(INITIAL_TUNES[0].id);

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
