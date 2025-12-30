
import React, { useState, useEffect, useMemo } from 'react';
import { Tune, PatternType, Transposition, Pattern, Section, Chord } from '../types';
import { getPracticeSuggestions } from '../geminiService';
import { JAZZ_SHAPES, SCALE_DATA } from '../constants';
import { transposeChord } from '../musicUtils';

interface PracticeModeProps {
  tune: Tune;
  transposition: Transposition;
}

interface Measure {
  chords: Chord[];
  startBeat: number;
}

const ScaleDiagram: React.FC<{ intervals: string }> = ({ intervals }) => {
  const pts = intervals.split(' ');
  return (
    <div className="flex gap-3 mt-5 overflow-x-auto pb-2 scrollbar-hide">
      {pts.map((p, i) => (
        <div key={i} className="flex flex-col items-center shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
            p.includes('b') || p.includes('#') 
              ? 'bg-slate-800 border-slate-700 text-slate-100' 
              : 'bg-sky-500/40 border-sky-400/80 text-white'
          }`}>
            {p}
          </div>
          {i < pts.length - 1 && <div className="h-[2px] w-4 bg-slate-800 mt-6"></div>}
        </div>
      ))}
    </div>
  );
};

const PracticeMode: React.FC<PracticeModeProps> = ({ tune, transposition }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timer, setTimer] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'chords' | 'tech'>('chords');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const activeSections = useMemo(() => {
    // Defensively check for variants existence
    if (tune.variants && tune.variants.length > 0 && tune.variants[selectedVariantIndex]) {
      return tune.variants[selectedVariantIndex].sections;
    }
    return tune.sections;
  }, [tune, selectedVariantIndex]);

  const groupedSections = useMemo(() => {
    let globalBeatOffset = 0;
    return activeSections.map(section => {
      const measures: Measure[] = [];
      let currentMeasureChords: Chord[] = [];
      let currentMeasureBeats = 0;
      let measureStartBeat = globalBeatOffset;

      section.chords.forEach((chord) => {
        currentMeasureChords.push(chord);
        currentMeasureBeats += chord.duration;

        if (currentMeasureBeats >= 4) {
          measures.push({ chords: [...currentMeasureChords], startBeat: measureStartBeat });
          globalBeatOffset += 4;
          measureStartBeat = globalBeatOffset;
          currentMeasureChords = [];
          currentMeasureBeats = 0;
        }
      });
      
      if (currentMeasureChords.length > 0) {
        measures.push({ chords: currentMeasureChords, startBeat: measureStartBeat });
        globalBeatOffset += currentMeasureBeats;
      }

      return { ...section, measures };
    });
  }, [activeSections]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const totalBeats = activeSections.reduce((acc, s) => acc + s.chords.reduce((bc, c) => bc + c.duration, 0), 0);
        setCurrentBeat((prev) => (prev + 1) % totalBeats);
        setTimer((prev) => prev + 1);
      }, (60 / (tune.tempo || 120)) * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tune.tempo, activeSections]);

  const loadAiSuggestions = async () => {
    setIsLoadingAi(true);
    const suggestions = await getPracticeSuggestions(tune, transposition);
    setAiSuggestions(suggestions);
    setIsLoadingAi(false);
  };

  const getPatternForBeat = (beat: number): Pattern | undefined => {
    return tune.patterns?.find(p => beat >= p.startBeat && beat < p.endBeat);
  };

  const getPatternTheme = (type: PatternType) => {
    switch(type) {
      case 'ii-V-I': return { bg: 'bg-sky-900/70', border: 'border-sky-400/80', text: 'text-sky-200', scales: 'Dorian → Mixo → Ionian' };
      case 'minor-ii-V-i': return { bg: 'bg-indigo-900/70', border: 'border-indigo-400/80', text: 'text-indigo-200', scales: 'm7b5 → Alt → Melodic m' };
      case 'turnaround': return { bg: 'bg-blue-900/70', border: 'border-blue-400/80', text: 'text-blue-200', scales: 'I-VI-ii-V Cycles' };
      case 'rhythm-changes': return { bg: 'bg-cyan-900/70', border: 'border-cyan-400/80', text: 'text-cyan-200', scales: 'Bebop Major' };
      default: return { bg: 'bg-slate-900/60', border: 'border-slate-700', text: 'text-slate-100', scales: '' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] font-sans relative">
      {/* Header Bar */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-10 py-5 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl">
             <i className="fas fa-music text-3xl"></i>
           </div>
           <div>
            <h2 className="text-5xl font-jazz text-white leading-none tracking-tight">{tune.title}</h2>
            <div className="flex gap-5 text-slate-100 text-[12px] font-black uppercase tracking-[0.25em] mt-2">
              <span className="text-sky-400 font-realbook text-lg lowercase">{tune.composer || 'Standard'}</span>
              <span className="opacity-40">|</span>
              <span className="text-white">{transposeChord(tune.key, transposition)}</span>
              <span className="opacity-40">|</span>
              <span className="text-white">{tune.tempo} BPM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {tune.variants && tune.variants.length > 1 && (
            <div className="flex bg-black/60 rounded-2xl p-2 border border-slate-700">
              {tune.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariantIndex(i)}
                  className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    selectedVariantIndex === i ? 'bg-slate-700 text-sky-400 shadow-inner' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
          <div className="bg-black/60 border border-slate-700 rounded-2xl p-2 flex">
            <button 
              onClick={() => setActiveTab('chords')}
              className={`px-10 py-3 text-[12px] font-black rounded-xl transition-all font-jazz tracking-[0.2em] ${activeTab === 'chords' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30' : 'text-slate-300 hover:text-white'}`}
            >COMPANION</button>
            <button 
              onClick={() => setActiveTab('tech')}
              className={`px-10 py-3 text-[12px] font-black rounded-xl transition-all font-jazz tracking-[0.2em] ${activeTab === 'tech' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30' : 'text-slate-300 hover:text-white'}`}
            >TECHNIQUE</button>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl ${
              isPlaying ? 'bg-slate-800 border-2 border-red-500 text-red-500' : 'bg-sky-500 text-black'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-12">
        <div className="max-w-7xl mx-auto space-y-32 pb-32">
          {activeTab === 'chords' ? (
            <div className="space-y-32 animate-in fade-in duration-500">
              {groupedSections.map((section, sIdx) => (
                <div key={section.id} className="relative">
                  <div className="absolute -left-16 top-0 h-full flex flex-col items-center">
                    <span className="text-8xl font-jazz text-slate-800/40 leading-none mb-8">{section.name}</span>
                    <div className="w-[4px] flex-1 bg-slate-800/20 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {section.measures.map((measure, mIdx) => {
                      const isCurrentBar = isPlaying && currentBeat >= measure.startBeat && currentBeat < measure.startBeat + 4;
                      const pattern = getPatternForBeat(measure.startBeat);
                      const theme = pattern ? getPatternTheme(pattern.type) : { bg: 'bg-slate-900/40', border: 'border-slate-800', text: 'text-white', scales: '' };
                      
                      const chordFontSize = measure.chords.length > 1 ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-7xl';

                      return (
                        <div 
                          key={mIdx}
                          className={`relative h-52 sm:h-64 rounded-[3.5rem] border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
                            isCurrentBar 
                              ? 'bg-sky-500 border-sky-300 shadow-[0_0_60px_rgba(14,165,233,0.5)] scale-110 z-20 text-black' 
                              : `${theme.bg} ${theme.border} ${pattern ? 'pattern-glow' : ''} text-white`
                          }`}
                        >
                          {pattern && !isCurrentBar && (
                            <div className="absolute top-6 left-0 w-full text-center px-6">
                              <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${theme.text}`}>
                                {pattern.type}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center justify-center gap-1 px-4 w-full">
                            {measure.chords.map((chord, cIdx) => (
                              <span 
                                key={cIdx} 
                                className={`${chordFontSize} font-realbook whitespace-nowrap overflow-hidden text-ellipsis ${isCurrentBar ? 'text-black' : 'text-white'}`}
                              >
                                {transposeChord(chord.symbol, transposition)}
                              </span>
                            ))}
                          </div>

                          {!isCurrentBar && pattern && (
                            <div className="absolute bottom-6 left-0 w-full text-center px-6">
                              <span className="text-[12px] font-black text-slate-300 font-realbook uppercase tracking-tighter">
                                {theme.scales}
                              </span>
                            </div>
                          )}
                          
                          {isCurrentBar && (
                             <div className="absolute bottom-8 flex gap-2">
                               {[0, 1, 2, 3].map(beat => (
                                 <div 
                                   key={beat} 
                                   className={`w-3 h-3 rounded-full border-2 border-black/30 ${Math.floor(currentBeat % 4) === beat ? 'bg-black' : 'bg-black/10'}`}
                                 ></div>
                               ))}
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-20">
               <section>
                 <div className="flex justify-between items-center mb-12">
                    <h3 className="text-5xl font-jazz text-white">The Technical Shed</h3>
                    <span className="text-lg text-sky-400 font-realbook bg-sky-500/10 px-8 py-3 rounded-full border border-sky-500/20 tracking-widest uppercase font-black text-xs">For ${transposition}</span>
                 </div>
                 <div className="grid lg:grid-cols-3 gap-12">
                    {SCALE_DATA.map((scale, i) => (
                      <div key={i} className="bg-[#0f172a] border-2 border-slate-800 p-12 rounded-[4rem] hover:border-sky-400 transition-all group shadow-2xl">
                         <h4 className="text-4xl font-jazz text-sky-400 mb-5 group-hover:text-sky-300">{scale.name}</h4>
                         <p className="text-slate-100 text-base mb-10 font-realbook leading-relaxed">{scale.description}</p>
                         <div className="bg-black/60 p-8 rounded-[2.5rem] border border-slate-900 shadow-inner">
                            <ScaleDiagram intervals={scale.intervals} />
                         </div>
                      </div>
                    ))}
                 </div>
               </section>
            </div>
          )}

          {/* AI Shed Oracle Section */}
          <div className="bg-[#0f172a] border-4 border-slate-800 rounded-[5rem] p-16 mt-20 overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-20 opacity-5 scale-[2] rotate-12 pointer-events-none">
               <i className="fas fa-crow text-9xl"></i>
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 relative z-10 gap-12">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 rounded-[2rem] bg-sky-500/10 border-4 border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                  <i className="fas fa-crow text-5xl"></i>
                </div>
                <div>
                  <h3 className="text-6xl font-jazz text-white leading-none">The Shed Oracle</h3>
                  <p className="text-[14px] text-slate-300 font-black uppercase tracking-[0.5em] mt-2">AI Harmonic Wisdom Mentor</p>
                </div>
              </div>
              
              <button 
                onClick={loadAiSuggestions}
                disabled={isLoadingAi}
                className="w-full lg:w-auto px-16 py-6 bg-slate-900 hover:bg-slate-800 border-4 border-sky-500/50 text-sky-400 text-sm font-black rounded-full transition-all uppercase tracking-[0.3em] shadow-2xl active:scale-95"
              >
                {isLoadingAi ? <i className="fas fa-compact-disc fa-spin mr-4"></i> : <i className="fas fa-bolt mr-4"></i>}
                {isLoadingAi ? 'Transcribing Wisdom...' : (aiSuggestions ? 'Next Shed Idea' : 'Light the Oracle')}
              </button>
            </div>

            {aiSuggestions ? (
              <div className="space-y-16 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="bg-black/60 p-16 rounded-[4rem] border-2 border-slate-700 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                   <p className="text-white text-3xl font-realbook leading-relaxed mb-16 border-l-8 border-sky-500/60 pl-16">
                      "{aiSuggestions.strategy}"
                   </p>
                   <div className="border-t-4 border-slate-800 pt-16">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-10">
                         <span className="text-[14px] font-black text-sky-400 uppercase tracking-[0.3em] bg-sky-500/20 px-10 py-3 rounded-full border-2 border-sky-400/40 shadow-xl">The Drill</span>
                         <h4 className="text-white text-5xl font-jazz tracking-wide">{aiSuggestions.drill.title}</h4>
                      </div>
                      <p className="text-slate-200 text-2xl font-realbook leading-relaxed opacity-90">{aiSuggestions.drill.description}</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-slate-700 border-8 border-dashed border-slate-800 rounded-[4rem] bg-black/20">
                <i className="fas fa-record-vinyl text-[120px] mb-12 opacity-10"></i>
                <p className="text-3xl font-jazz tracking-[0.3em] opacity-40 uppercase">Awaiting Harmonic Wisdom</p>
                <p className="text-xl font-realbook mt-5 opacity-30 italic">Target 3rds, connect the lines, own the shed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
