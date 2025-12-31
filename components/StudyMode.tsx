
import React, { useState, useEffect } from 'react';
import { Tune, Transposition, Chord } from '../types.ts';
import { transposeChord, chunkArray, formatMusical } from '../musicUtils.ts';

interface StudyModeProps {
  tunes: Tune[];
  transposition: Transposition;
  selectedTuneId?: string;
  onTuneSelect: (id: string) => void;
}

type QuizType = 'CHUNKS' | 'VISUALIZATION' | 'FORM' | 'SCALES';

interface ScaleRelationship {
  scaleName: string;
  intervals: string;
  description: string;
  pedagogy: string;
}

const StudyMode: React.FC<StudyModeProps> = ({ tunes, transposition, selectedTuneId, onTuneSelect }) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tuneIndex, setTuneIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [flashcardStep, setFlashcardStep] = useState(0); 
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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
    if (activeQuiz === 'SCALES') {
      setChunkIndex((prev) => (prev + 1) % allChords.length);
    } else if (chunks.length > 0) {
      setChunkIndex((prev) => (prev + 1) % chunks.length);
    }
  };

  const getScaleForChord = (chordSymbol: string): ScaleRelationship => {
    const symbol = chordSymbol.toLowerCase();
    
    if (symbol.includes('m7b5')) {
      return {
        scaleName: 'Locrian #2',
        intervals: '1 2 b3 4 b5 b6 b7',
        description: 'The standard choice for half-diminished chords in jazz.',
        pedagogy: 'Treat this as a Natural Minor scale but with a b5. The natural 2nd (rather than b2) makes it sound more "modern" and less dark.'
      };
    }
    if (symbol.includes('7alt')) {
      return {
        scaleName: 'Altered Scale',
        intervals: '1 b2 b3 b4 b5 b6 b7',
        description: 'Maximum tension for dominant chords.',
        pedagogy: 'This is the 7th mode of Melodic Minor. It contains all the possible alterations: b5, #5, b9, #9. It creates the most urgent pull toward the resolution.'
      };
    }
    if (symbol.includes('maj7')) {
      return {
        scaleName: 'Lydian',
        intervals: '1 2 3 #4 5 6 7',
        description: 'The brightest major sound.',
        pedagogy: 'In jazz, we often prefer the #4 over the natural 4 to avoid the "avoid note" clash with the major 3rd.'
      };
    }
    if (symbol.includes('m7')) {
      return {
        scaleName: 'Dorian',
        intervals: '1 2 b3 4 5 6 b7',
        description: 'The backbone of minor jazz harmony.',
        pedagogy: 'Listen for the natural 6th. It gives the minor chord a "soulful" lift compared to the darker Aeolian (natural minor).'
      };
    }
    if (symbol.includes('7') && !symbol.includes('alt') && !symbol.includes('maj')) {
      return {
        scaleName: 'Mixolydian',
        intervals: '1 2 3 4 5 6 b7',
        description: 'The primary dominant sound.',
        pedagogy: 'Focus on the b7. This scale works best on "static" dominant chords that aren\'t resolving as a V-I, or as a safe base for bluesy playing.'
      };
    }
    return {
      scaleName: 'Chromatic / Chord Tones',
      intervals: '1 3 5 7',
      description: 'Focus on the DNA of the chord.',
      pedagogy: 'When in doubt, play the chord tones. Connect them with chromatic passing notes.'
    };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-jazz text-white">Study Room</h2>
          <p className="text-zinc-400 mt-2 font-realbook text-xl">Pedagogical Drills: Move knowledge from the page to your ear.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
           <button 
             onClick={() => setIsSelectorOpen(!isSelectorOpen)}
             className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-left flex justify-between items-center hover:border-sky-500/50 transition-all shadow-xl"
           >
             <span className="font-bold text-sky-400 truncate text-lg">{currentTune?.title || 'Select Tune'}</span>
             <i className={`fas fa-chevron-down text-base transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}></i>
           </button>
           
           {isSelectorOpen && (
             <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {tunes.map(tune => (
                  <button
                    key={tune.id}
                    onClick={() => {
                      onTuneSelect(tune.id);
                      setIsSelectorOpen(false);
                      setChunkIndex(0);
                      setShowAnswer(false);
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-800 transition-colors text-base border-b border-slate-800/50 last:border-0 ${
                      tune.id === selectedTuneId ? 'text-sky-400 bg-sky-400/5' : 'text-slate-300'
                    }`}
                  >
                    {tune.title}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { 
            id: 'SCALES' as QuizType, 
            label: 'Scale Theory', 
            icon: 'fa-graduation-cap', 
            color: 'border-emerald-500/20 text-emerald-500', 
            desc: 'Learn which scales "shed" best over specific chord qualities.' 
          },
          { 
            id: 'CHUNKS' as QuizType, 
            label: 'Chunking', 
            icon: 'fa-cubes', 
            color: 'border-amber-500/20 text-amber-500', 
            desc: 'Recall 4-bar harmonic phrases to build subconscious roadmap vision.' 
          },
          { 
            id: 'VISUALIZATION' as QuizType, 
            label: 'Guide Tones', 
            icon: 'fa-eye', 
            color: 'border-blue-500/20 text-blue-500', 
            desc: 'Visualize fingerings for 3rds and 7ths. The skeleton of soloing.' 
          },
          { 
            id: 'FORM' as QuizType, 
            label: 'Form Mapping', 
            icon: 'fa-layer-group', 
            color: 'border-purple-500/20 text-purple-500', 
            desc: 'Master the macro-structure so you never get lost in the form.' 
          },
        ].map((mode) => (
          <button 
            key={mode.id}
            onClick={() => { setActiveQuiz(mode.id); setChunkIndex(0); setShowAnswer(false); setFlashcardStep(0); }}
            className={`flex flex-col items-start p-6 rounded-[2rem] bg-[#0f172a] border-2 transition-all text-left group shadow-lg ${
              activeQuiz === mode.id ? 'border-sky-500 shadow-sky-500/10' : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-black/40 border border-white/5 ${mode.color}`}>
               <i className={`fas ${mode.icon} text-xl`}></i>
            </div>
            <span className="font-jazz text-2xl text-white mb-2">{mode.label}</span>
            <span className="text-sm text-zinc-500 uppercase font-black tracking-widest leading-relaxed">{mode.desc}</span>
          </button>
        ))}
      </div>

      {activeQuiz === 'SCALES' && currentTune ? (
        <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500 pointer-events-none">
             <i className="fas fa-graduation-cap text-[120px]"></i>
           </div>
           
           <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-black uppercase tracking-[0.3em] bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20">Scale Theory Mastery</span>
              
              <div className="mt-12 mb-16">
                 <h3 className="text-zinc-500 text-lg font-realbook mb-4 italic">Think fast: What scale works best over this chord?</h3>
                 <div className="text-7xl font-bold font-realbook text-white">
                   {formatMusical(transposeChord(allChords[chunkIndex]?.symbol || 'C', transposition))}
                 </div>
              </div>

              {showAnswer ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="bg-black/40 p-10 rounded-[2.5rem] border border-emerald-500/20">
                    <h4 className="text-emerald-400 text-4xl font-jazz tracking-wider mb-2">
                       {formatMusical(getScaleForChord(allChords[chunkIndex]?.symbol).scaleName)}
                    </h4>
                    <div className="flex justify-center gap-3 mb-6">
                      {getScaleForChord(allChords[chunkIndex]?.symbol).intervals.split(' ').map((interval, i) => (
                        <div key={i} className="w-14 h-14 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-300">
                          {formatMusical(interval)}
                        </div>
                      ))}
                    </div>
                    <div className="text-left space-y-4 pt-6 border-t border-slate-800">
                       <p className="text-slate-300 font-realbook text-xl">
                         <span className="text-emerald-500 font-black uppercase text-sm tracking-widest block mb-1">Pedagogy Logic</span>
                         {formatMusical(getScaleForChord(allChords[chunkIndex]?.symbol).pedagogy)}
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button onClick={handleNext} className="px-10 py-4 bg-emerald-500 text-black font-jazz text-2xl rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">Got it! Next Chord</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="px-16 py-6 bg-slate-900 border-2 border-emerald-500/40 text-emerald-400 font-jazz text-3xl rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-2xl"
                >
                  Reveal Scale
                </button>
              )}
           </div>
        </div>
      ) : activeQuiz === 'CHUNKS' && currentTune && chunks.length > 0 ? (
        <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 relative overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center items-center gap-3 mb-10">
               <span className="text-amber-500 text-sm font-black uppercase tracking-widest bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20">Harmonic Chunking</span>
            </div>
            
            <div className="mb-12">
              <h3 className="text-4xl font-jazz text-white mb-4">Recall the 4-bar phrase in your head.</h3>
              <p className="text-zinc-500 font-realbook text-xl italic">Visualization builds a mental bridge to the ear.</p>
            </div>

            <div className="min-h-[160px] flex items-center justify-center mb-12">
              {showAnswer ? (
                <div className="animate-in fade-in duration-500 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                  {chunks[chunkIndex]?.map((chord: Chord, i: number) => (
                    <div key={i} className="bg-black/40 border-2 border-amber-500/30 rounded-[2rem] p-8 flex flex-col items-center justify-center aspect-square shadow-inner group hover:border-amber-500 transition-all">
                       <span className="text-5xl font-bold font-realbook text-amber-500 group-hover:scale-110 transition-transform">{formatMusical(transposeChord(chord.symbol, transposition))}</span>
                       <span className="text-xs text-zinc-600 font-black mt-4 uppercase tracking-tighter">Measure {i+1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="px-16 py-6 bg-amber-500 text-black font-jazz text-3xl rounded-2xl hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 uppercase tracking-widest"
                >
                  Recall Chords
                </button>
              )}
            </div>

            <div className="flex justify-center gap-6">
              <button 
                onClick={handleNext}
                className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-colors text-sm font-black uppercase tracking-widest rounded-2xl"
              >
                Next Chunk
              </button>
            </div>
          </div>
        </div>
      ) : activeQuiz === 'VISUALIZATION' && currentTune ? (
        <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-blue-500 text-sm font-black uppercase tracking-widest bg-blue-500/10 px-6 py-2 rounded-full border border-blue-500/20">Guide Tone Vision</span>

            <div className="mt-12 mb-12 bg-black/40 p-16 rounded-[3rem] border-2 border-slate-900 shadow-inner">
               <div className="text-7xl font-bold font-realbook text-blue-400 mb-8">
                 {formatMusical(transposeChord(allChords[chunkIndex]?.symbol || 'C', transposition))}
               </div>
               
               {flashcardStep > 0 ? (
                 <div className="animate-in fade-in duration-500 text-zinc-300 space-y-6">
                   <div className="flex flex-col items-center">
                     <span className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Visualize Fingerings</span>
                     <div className="bg-sky-500/10 border border-sky-500/20 px-8 py-4 rounded-2xl">
                        <p className="text-3xl font-jazz text-sky-400">Identify 3rd & 7th</p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => setFlashcardStep(1)}
                   className="text-sm font-black text-zinc-600 uppercase tracking-[0.3em] hover:text-blue-400 transition-colors bg-white/5 px-6 py-2 rounded-full border border-white/5"
                 >
                   Verify Guide Tones
                 </button>
               )}
            </div>

            <button onClick={handleNext} className="px-10 py-4 bg-blue-600 text-white font-jazz text-2xl rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Next Chord</button>
          </div>
        </div>
      ) : activeQuiz === 'FORM' && currentTune ? (
        <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 relative animate-in fade-in duration-300">
           <div className="text-center max-w-2xl mx-auto">
            <span className="text-purple-500 text-sm font-black uppercase tracking-widest bg-purple-500/10 px-6 py-2 rounded-full border border-purple-500/20">Roadmap Recall</span>

            <div className="mt-12 mb-12 min-h-[160px] flex flex-col items-center justify-center">
              {showAnswer ? (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <div className="text-8xl font-bold font-jazz text-purple-400 tracking-tighter">{currentTune.form}</div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {currentTune.sections.map(s => (
                      <span key={s.id} className="bg-slate-900 px-6 py-3 rounded-2xl text-xs font-black text-slate-400 border border-slate-800 uppercase tracking-widest">{s.name} Section</span>
                    ))}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="px-16 py-6 bg-purple-600 text-white font-jazz text-3xl rounded-2xl hover:bg-purple-500 transition-all shadow-2xl"
                >
                  Reveal Roadmap
                </button>
              )}
            </div>

            <button onClick={handleNext} className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white font-black uppercase tracking-widest text-sm rounded-2xl">Skip Tune</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-[#0f172a]/20 rounded-[4rem] border-4 border-dashed border-slate-800 text-slate-800 group">
           <i className="fas fa-graduation-cap text-9xl mb-8 opacity-5 group-hover:opacity-10 transition-opacity"></i>
           <p className="text-3xl font-jazz tracking-widest uppercase opacity-40">Select a Pedagogical Mode</p>
           <p className="text-slate-700 font-realbook mt-4 max-w-sm text-center text-base italic">These exercises are designed to move knowledge from the "page" into your subconscious "ear".</p>
        </div>
      )}
    </div>
  );
};

export default StudyMode;
