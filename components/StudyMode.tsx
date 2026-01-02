
import React, { useState, useEffect, useMemo } from 'react';
import { Tune, Transposition, Chord } from '../types.ts';
import { transposeChord, chunkArray, formatMusical, getGuideTones, getRequiredScales, getScaleNotes } from '../musicUtils.ts';
import { SCALE_DATA, SCALE_DEGREES } from '../constants.ts';

interface StudyModeProps {
  tunes: Tune[];
  transposition: Transposition;
  selectedTuneId?: string;
  onTuneSelect: (id: string) => void;
}

type QuizType = 'SPEED_SHED' | 'DNA_MATRIX' | 'CHUNKS' | 'FORM';

const ScaleDNAMatrix: React.FC<{ tune?: Tune }> = ({ tune }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [highlightMode, setHighlightMode] = useState(true);
  const [showRealNotes, setShowRealNotes] = useState(false); // New state for toggling real notes
  
  const requiredScales = useMemo(() => tune ? getRequiredScales(tune) : new Map<string, string>(), [tune]);

  const allTags = useMemo(() => {
    const tags = new Set<string>(['All']);
    SCALE_DEGREES.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const filteredScales = useMemo(() => {
    let list = SCALE_DEGREES;
    if (activeFilter !== 'All') list = list.filter(s => s.tags?.includes(activeFilter));
    return list;
  }, [activeFilter]);

  const defaultRootForNotes = 'C'; // Consistent root for displaying real notes in the matrix

  return (
    <div className="bg-[#0f172a] rounded-[3rem] p-8 md:p-12 border-2 border-slate-800 animate-in fade-in duration-500 shadow-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
           <div>
              <h3 className="text-3xl font-jazz text-white leading-none">The Scale DNA Matrix</h3>
              <p className="text-slate-500 font-realbook text-sm mt-2">
                {tune ? `Highlighting DNA required for "${tune.title}"` : 'Filter by harmonic context to see structural differences.'}
              </p>
           </div>
           
           <div className="flex flex-wrap gap-6 items-center">
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Accidental (♭)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Natural</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Accidental (♯)</span>
                </div>
             </div>

             {tune && (
               <button 
                 onClick={() => setHighlightMode(!highlightMode)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${highlightMode ? 'bg-sky-500 border-sky-400 text-black' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
               >
                 {highlightMode ? 'Focus: Repertoire' : 'Show All'}
               </button>
             )}
             <button
               onClick={() => setShowRealNotes(!showRealNotes)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showRealNotes ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}`}
             >
               {showRealNotes ? 'Show Degrees' : 'Show Notes'}
             </button>
           </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mb-8 bg-black/30 p-4 rounded-2xl border border-slate-800 shadow-inner">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeFilter === tag 
                  ? 'bg-sky-500 border-sky-400 text-black shadow-lg shadow-sky-500/20' 
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1200px]"> {/* Increased min-width for Scale Name visibility */}
            <div className="grid grid-cols-[280px_repeat(8,1fr)_180px] gap-4 text-center font-black uppercase tracking-widest text-slate-600 text-[9px] pb-4 border-b border-slate-800">
              <div className="text-left">Scale Identity</div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
              <div>7</div>
              <div className="text-amber-400">8 (PT)</div>
              <div className="text-right">Shed Tip / Form</div>
            </div>

            <div className="space-y-3 mt-4">
              {filteredScales.map((scale, i) => {
                const isRequired = requiredScales.has(scale.name);
                const tip = requiredScales.get(scale.name);
                const scaleNotes = showRealNotes ? getScaleNotes(defaultRootForNotes, scale.degrees) : [];
                
                // Dim if tune is selected but this scale isn't used
                const opacity = (tune && highlightMode && !isRequired) ? 'opacity-20 grayscale' : 'opacity-100';
                
                return (
                  <div 
                    key={i} 
                    className={`grid grid-cols-[280px_repeat(8,1fr)_180px] gap-4 items-center group py-1 transition-all duration-500 ${opacity} ${isRequired ? 'scale-[1.01]' : ''}`}
                  >
                    <div className="text-left pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`font-jazz text-xl transition-colors ${isRequired ? 'text-sky-400' : 'text-slate-300 group-hover:text-sky-400'}`}>
                          {scale.name}
                        </div>
                        {isRequired && (
                          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(14,165,233,1)]"></div>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {scale.tags?.slice(0, 2).map(t => (
                          <span key={t} className="text-[8px] font-black text-slate-600 uppercase tracking-tighter border border-slate-800 px-1.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {[0, 1, 2, 3, 4, 5, 6, 7].map((dIdx) => {
                      const deg = scale.degrees[dIdx];
                      const displayValue = showRealNotes ? scaleNotes[dIdx] : deg;

                      if (!deg) return <div key={dIdx} className="h-12 rounded-xl border-2 border-dashed border-slate-800/10 opacity-10"></div>;

                      let colorClass = 'bg-slate-900 border-slate-800 text-slate-500'; // Natural
                      if (deg.includes('b')) colorClass = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
                      else if (deg.includes('#')) colorClass = 'bg-amber-500/15 border-amber-500/40 text-amber-300';
                      
                      return (
                        <div key={dIdx} className={`h-12 rounded-xl flex items-center justify-center font-bold border-2 transition-all ${colorClass}`}>
                          {formatMusical(displayValue)}
                        </div>
                      );
                    })}

                    <div className="text-right">
                       {isRequired ? (
                         <span className="text-[10px] font-realbook text-sky-400/80 leading-tight block italic">{tip}</span>
                       ) : (
                         <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Theory only</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeedShedGame: React.FC<{ tune: Tune, transposition: Transposition, onNext: () => void }> = ({ tune, transposition, onNext }) => {
  const allChords = useMemo(() => tune.sections.flatMap(s => s.chords), [tune]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  
  const currentChord = allChords[currentIndex];
  const options = useMemo(() => {
    // Pick 3 random scale names from SCALE_DATA, ensuring the correct one is included
    const correct = SCALE_DATA.find(s => s.targets?.some(t => currentChord.symbol.toLowerCase().includes(t)))?.name || 'Dorian';
    const others = SCALE_DATA.filter(s => s.name !== correct).sort(() => 0.5 - Math.random()).slice(0, 3).map(s => s.name);
    return [correct, ...others].sort(() => 0.5 - Math.random());
  }, [currentChord]);

  const handleChoice = (choice: string) => {
    const correct = SCALE_DATA.find(s => s.targets?.some(t => currentChord.symbol.toLowerCase().includes(t)))?.name || 'Dorian';
    if (choice === correct) {
      setScore(s => s + 100);
      setStreak(s => s + 1);
      setLastCorrect(true);
      setTimeout(() => {
        setLastCorrect(null);
        setCurrentIndex(prev => (prev + 1) % allChords.length);
      }, 600);
    } else {
      setStreak(0);
      setLastCorrect(false);
      setTimeout(() => setLastCorrect(null), 1000);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 text-center animate-in fade-in duration-500 shadow-2xl">
       <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Current Score</span>
            <span className="text-4xl font-jazz text-sky-400">{score}</span>
          </div>
          <div className="bg-sky-500/10 px-6 py-2 rounded-full border border-sky-500/20 shadow-inner">
             <span className="text-sm font-black text-sky-400 uppercase tracking-widest">Streak: {streak}</span>
          </div>
       </div>

       <div className="mb-16">
          <p className="text-slate-500 font-realbook text-xl mb-6">Which scale best fits this quality?</p>
          <div className={`text-8xl font-bold font-realbook transition-all duration-300 ${lastCorrect === true ? 'text-emerald-500 scale-110' : lastCorrect === false ? 'text-rose-500 shake' : 'text-white'}`}>
            {formatMusical(transposeChord(currentChord.symbol, transposition))}
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => handleChoice(opt)}
              className="py-6 px-8 bg-slate-900 border-2 border-slate-800 rounded-2xl font-jazz text-2xl text-slate-300 hover:border-sky-500 hover:text-white hover:bg-sky-500/5 transition-all active:scale-95 shadow-md"
            >
              {opt}
            </button>
          ))}
       </div>
    </div>
  );
};

const StudyMode: React.FC<StudyModeProps> = ({ tunes, transposition, selectedTuneId, onTuneSelect }) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tuneIndex, setTuneIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
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
    if (chunks.length > 0) {
      setChunkIndex((prev) => (prev + 1) % chunks.length);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-5xl font-jazz text-white leading-none">The Shed Study</h2>
          <p className="text-zinc-400 mt-3 font-realbook text-xl">Pedagogical Drills for Harmonic Mastery.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
           <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-left flex justify-between items-center hover:border-sky-500/50 transition-all shadow-xl">
             <span className="font-bold text-sky-400 truncate text-lg">{currentTune?.title || 'Select Tune'}</span>
             <i className={`fas fa-chevron-down text-xs transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}></i>
           </button>
           
           {isSelectorOpen && (
             <div className="absolute top-full left-0 w-full mt-2 bg-[#080c1d] border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                {tunes.map(tune => (
                  <button 
                    key={tune.id} 
                    onClick={() => { onTuneSelect(tune.id); setIsSelectorOpen(false); setChunkIndex(0); setShowAnswer(false); }} 
                    className={`w-full text-left px-6 py-4 hover:bg-slate-800 transition-colors text-sm border-b border-slate-800/30 last:border-0 ${tune.id === selectedTuneId ? 'text-sky-400 bg-sky-400/5 font-bold' : 'text-slate-400'}`}
                  >
                    {tune.title}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { id: 'SPEED_SHED' as QuizType, label: 'Speed Shed', icon: 'fa-bolt', color: 'text-amber-400', desc: 'Identify scales under pressure.' },
          { id: 'DNA_MATRIX' as QuizType, label: 'DNA Matrix', icon: 'fa-dna', color: 'text-rose-500', desc: 'Comparative scale visualization.' },
          { id: 'CHUNKS' as QuizType, label: 'Harmonic Recall', icon: 'fa-brain', color: 'text-sky-400', desc: 'Internalize 4-bar movements.' },
          { id: 'FORM' as QuizType, label: 'Form Check', icon: 'fa-map-location-dot', color: 'text-purple-500', desc: 'Recall the tune roadmap.' },
        ].map((mode) => (
          <button 
            key={mode.id}
            onClick={() => { setActiveQuiz(mode.id); setChunkIndex(0); setShowAnswer(false); }}
            className={`flex flex-col items-start p-8 rounded-[2.5rem] bg-[#0f172a] border-2 transition-all text-left group relative overflow-hidden ${activeQuiz === mode.id ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-slate-800 hover:border-slate-600'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 border border-white/5 ${mode.color}`}>
               <i className={`fas ${mode.icon} text-2xl`}></i>
            </div>
            <span className="font-jazz text-2xl text-white mb-2">{mode.label}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] leading-tight">{mode.desc}</span>
            {activeQuiz === mode.id && <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>}
          </button>
        ))}
      </div>

      <div className="space-y-12 pb-32">
        {activeQuiz === 'SPEED_SHED' && currentTune && (
          <SpeedShedGame tune={currentTune} transposition={transposition} onNext={handleNext} />
        )}

        {activeQuiz === 'DNA_MATRIX' && (
          <ScaleDNAMatrix tune={currentTune} />
        )}

        {activeQuiz === 'CHUNKS' && currentTune && (
          <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 text-center animate-in fade-in duration-500 shadow-2xl">
             <span className="text-sky-400 text-[10px] font-black uppercase tracking-widest bg-sky-500/10 px-6 py-2 rounded-full border border-sky-500/20">Harmonic Recall</span>
             <div className="mt-12 mb-16 h-24 flex items-center justify-center">
                <h3 className="text-4xl font-jazz text-white uppercase tracking-widest">Measure {chunkIndex * 4 + 1} - {chunkIndex * 4 + 4}</h3>
             </div>
             {showAnswer ? (
               <div className="animate-in zoom-in-95 duration-500 grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                 {chunks[chunkIndex]?.map((chord, i) => (
                   <div key={i} className="bg-black/40 border-2 border-sky-500/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center aspect-square shadow-inner transition-transform hover:scale-105">
                      <span className="text-5xl font-bold font-realbook text-sky-400">{formatMusical(transposeChord(chord.symbol, transposition))}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <button onClick={() => setShowAnswer(true)} className="px-16 py-8 bg-sky-500 text-black font-jazz text-3xl rounded-[2rem] uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all transform hover:scale-105 active:scale-95">Recall Chords</button>
             )}
             {showAnswer && <div className="mt-12"><button onClick={handleNext} className="px-12 py-5 bg-slate-900 text-slate-500 font-black uppercase text-[11px] rounded-2xl border border-slate-800 hover:text-white transition-all hover:bg-slate-800">Next Chunk</button></div>}
          </div>
        )}

        {activeQuiz === 'FORM' && currentTune && (
          <div className="bg-[#0f172a] rounded-[3rem] p-12 border-2 border-slate-800 text-center animate-in fade-in duration-500 shadow-2xl">
             <span className="text-purple-500 text-[10px] font-black uppercase tracking-widest bg-purple-500/10 px-6 py-2 rounded-full border border-purple-500/20">Form Recall</span>
             <div className="mt-12 mb-12 min-h-[200px] flex flex-col items-center justify-center">
               {showAnswer ? (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                   <div className="text-9xl font-bold font-jazz text-purple-400 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">{currentTune.form}</div>
                 </div>
               ) : (
                 <button onClick={() => setShowAnswer(true)} className="px-20 py-8 bg-purple-600 text-white font-jazz text-3xl rounded-[2rem] shadow-2xl hover:bg-purple-500 transition-all hover:scale-105">Reveal Roadmap</button>
               )}
             </div>
             {showAnswer && <button onClick={handleNext} className="px-12 py-5 bg-slate-900 border border-slate-800 text-slate-500 font-black uppercase text-[11px] rounded-2xl transition-all hover:text-white">Next Tune</button>}
          </div>
        )}

        {!activeQuiz && (
          <div className="flex flex-col items-center justify-center py-52 bg-[#0f172a]/20 rounded-[4rem] border-4 border-dashed border-slate-800/40 text-slate-800 group transition-all hover:border-sky-500/20">
             <i className="fas fa-microscope text-9xl mb-8 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110"></i>
             <p className="text-3xl font-jazz tracking-[0.3em] uppercase opacity-30 group-hover:opacity-50 transition-opacity">Select a Diagnostic Drill</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
