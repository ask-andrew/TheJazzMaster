
import React, { useState, useEffect } from 'react';
import { Tune, Transposition, Chord } from '../types';
import { transposeChord, chunkArray } from '../musicUtils';

interface StudyModeProps {
  tunes: Tune[];
  transposition: Transposition;
  selectedTuneId?: string;
  onTuneSelect: (id: string) => void;
}

type QuizType = 'CHUNKS' | 'VISUALIZATION' | 'FORM';

const StudyMode: React.FC<StudyModeProps> = ({ tunes, transposition, selectedTuneId, onTuneSelect }) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tuneIndex, setTuneIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [flashcardStep, setFlashcardStep] = useState(0); // 0: Question, 1: Hint/Guide, 2: Answer
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Sync internal tuneIndex with the externally selectedTuneId
  useEffect(() => {
    if (selectedTuneId) {
      const idx = tunes.findIndex(t => t.id === selectedTuneId);
      if (idx !== -1) setTuneIndex(idx);
    }
  }, [selectedTuneId, tunes]);

  const currentTune = tunes[tuneIndex];
  const allChords: Chord[] = currentTune?.sections.flatMap(s => s.chords) || [];
  const chunks: Chord[][] = chunkArray(allChords, 4); 

  const handleNext = () => {
    setShowAnswer(false);
    setFlashcardStep(0);
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex(prev => prev + 1);
    } else {
      setChunkIndex(0);
      // Optional: cycle through tunes or just stay on one
    }
  };

  const getGuideTones = (chordSymbol: string) => {
    const match = chordSymbol.match(/^([A-G][b#]?)/);
    if (!match) return '?';
    return `3rd & 7th of ${transposeChord(chordSymbol, transposition)}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-jazz text-white">Study Room</h2>
          <p className="text-zinc-400 mt-1">Science-based jazz pedagogy: Visualization, Chunking, and Active Recall.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
           <button 
             onClick={() => setIsSelectorOpen(!isSelectorOpen)}
             className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-left flex justify-between items-center hover:border-amber-500/50 transition-all"
           >
             <span className="font-bold text-amber-500 truncate">{currentTune?.title || 'Select Tune'}</span>
             <i className={`fas fa-chevron-down text-xs transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}></i>
           </button>
           
           {isSelectorOpen && (
             <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {tunes.map(tune => (
                  <button
                    key={tune.id}
                    onClick={() => {
                      onTuneSelect(tune.id);
                      setIsSelectorOpen(false);
                      setChunkIndex(0);
                      setShowAnswer(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors text-sm border-b border-zinc-800/50 last:border-0 ${
                      tune.id === selectedTuneId ? 'text-amber-500 bg-amber-500/5' : 'text-zinc-300'
                    }`}
                  >
                    {tune.title}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[
          { 
            id: 'CHUNKS' as QuizType, 
            label: 'Harmonic Chunking', 
            icon: 'fa-cubes', 
            color: 'border-amber-500/20 text-amber-500', 
            desc: 'Recall 4-bar phrases. Builds long-term "muscle memory" for progressions.' 
          },
          { 
            id: 'VISUALIZATION' as QuizType, 
            label: 'Guide Tone Vision', 
            icon: 'fa-eye', 
            color: 'border-blue-500/20 text-blue-500', 
            desc: 'Visualize saxophone fingerings for 3rds and 7ths. Essential for voice leading.' 
          },
          { 
            id: 'FORM' as QuizType, 
            label: 'Form Analysis', 
            icon: 'fa-layer-group', 
            color: 'border-purple-500/20 text-purple-500', 
            desc: 'Recall the macro-structure. Never get lost in a chorus again.' 
          },
        ].map((mode) => (
          <button 
            key={mode.id}
            onClick={() => { setActiveQuiz(mode.id); setChunkIndex(0); setShowAnswer(false); setFlashcardStep(0); }}
            className={`flex flex-col items-start p-6 rounded-3xl bg-zinc-900 border transition-all text-left group ${
              activeQuiz === mode.id ? 'border-amber-500/50 shadow-xl bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <i className={`fas ${mode.icon} text-2xl mb-4 ${mode.color}`}></i>
            <span className="font-bold text-lg text-white mb-2">{mode.label}</span>
            <span className="text-xs text-zinc-500 leading-relaxed">{mode.desc}</span>
          </button>
        ))}
      </div>

      {activeQuiz === 'CHUNKS' && currentTune ? (
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/10">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${((chunkIndex + 1) / chunks.length) * 100}%` }}></div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-8">
               <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">Harmonic Chunking</span>
               <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{currentTune.title} • Segment {chunkIndex + 1} of {chunks.length}</span>
            </div>
            
            <div className="mb-12">
              <h3 className="text-3xl font-jazz text-white mb-4">What are the chords for this 4-bar phrase?</h3>
              <p className="text-zinc-500 text-sm max-w-md mx-auto italic">Visualize the movement of the harmony in your mind's eye.</p>
            </div>

            <div className="min-h-[160px] flex items-center justify-center mb-12">
              {showAnswer ? (
                <div className="animate-in fade-in duration-500 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
                  {chunks[chunkIndex]?.map((chord: Chord, i: number) => (
                    <div key={i} className="bg-zinc-800 border-2 border-amber-500/30 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square">
                       <span className="text-3xl font-bold font-jazz text-amber-500">{transposeChord(chord.symbol, transposition)}</span>
                       <span className="text-[10px] text-zinc-600 font-bold mt-2 uppercase">Bar {i+1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="px-12 py-5 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 text-lg uppercase tracking-widest"
                >
                  Recall Chords
                </button>
              )}
            </div>

            <div className="flex justify-center gap-6">
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
              >
                Skip Segment
              </button>
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-all text-sm font-bold"
              >
                Internalized! Next
              </button>
            </div>
          </div>
        </div>
      ) : activeQuiz === 'VISUALIZATION' && currentTune ? (
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-8">
               <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Guide Tone Visualization</span>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-jazz text-white mb-2">Internalize the Guide Tones</h3>
              <p className="text-zinc-500 text-sm italic">Imagine the saxophone keys for the 3rd and 7th of:</p>
            </div>

            <div className="mb-12 bg-black/40 p-12 rounded-3xl border border-zinc-800">
               <div className="text-6xl font-bold font-jazz text-blue-400 mb-6">
                 {transposeChord(chunks[chunkIndex]?.[0]?.symbol || 'C', transposition)}
               </div>
               
               {flashcardStep > 0 ? (
                 <div className="animate-in fade-in duration-500 text-zinc-300 space-y-4">
                   <p className="text-lg">Target: <span className="text-amber-500 font-bold">{getGuideTones(chunks[chunkIndex]?.[0]?.symbol || 'C')}</span></p>
                   {flashcardStep === 1 && (
                     <p className="text-sm text-zinc-500">Close your eyes. See your left and right hand fingers position for these notes.</p>
                   )}
                 </div>
               ) : (
                 <div className="h-20 flex items-center justify-center">
                   <button 
                     onClick={() => setFlashcardStep(1)}
                     className="text-xs font-bold text-zinc-600 uppercase tracking-widest hover:text-blue-400 transition-colors"
                   >
                     Identify Guide Tones
                   </button>
                 </div>
               )}
            </div>

            <div className="flex justify-center gap-6">
              <button 
                onClick={handleNext}
                className="px-10 py-4 bg-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 transition-all"
              >
                Next Chord
              </button>
            </div>
          </div>
        </div>
      ) : activeQuiz === 'FORM' && currentTune ? (
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 relative overflow-hidden animate-in fade-in duration-300">
           <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-8">
               <span className="text-purple-500 text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">Form Analysis</span>
            </div>

            <div className="mb-12">
              <h3 className="text-3xl font-jazz text-white mb-4">Recall the Form for {currentTune.title}</h3>
              <p className="text-zinc-500 text-sm">How many sections? What is the structure?</p>
            </div>

            <div className="min-h-[160px] flex flex-col items-center justify-center mb-12 space-y-4">
              {showAnswer ? (
                <div className="animate-in fade-in duration-500 space-y-4">
                  <div className="text-5xl font-bold font-jazz text-purple-400">{currentTune.form}</div>
                  <div className="flex gap-2">
                    {currentTune.sections.map(s => (
                      <span key={s.id} className="bg-zinc-800 px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 border border-zinc-700">{s.name}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="px-12 py-5 bg-purple-500 text-white font-bold rounded-2xl hover:bg-purple-400 transition-all"
                >
                  Reveal Roadmap
                </button>
              )}
            </div>

            <button 
              onClick={handleNext}
              className="px-10 py-4 bg-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 transition-all"
            >
              Next Segment
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/10 rounded-3xl border border-zinc-800/30 border-dashed text-zinc-700">
           <i className="fas fa-graduation-cap text-6xl mb-6 opacity-5"></i>
           <p className="text-xl font-jazz">Select a pedagogical mode to begin training.</p>
           <p className="text-sm mt-2 max-w-sm text-center">These exercises are designed to move knowledge from the "page" into your subconscious "ear".</p>
        </div>
      )}
    </div>
  );
};

export default StudyMode;
