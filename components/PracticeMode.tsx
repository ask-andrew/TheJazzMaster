
import React, { useState, useEffect, useMemo } from 'react';
import { Tune, PatternType, Transposition, Pattern, Section, Chord } from '../types.ts';
import { getPracticeSuggestions } from '../geminiService.ts';
import { SCALE_DATA } from '../constants.ts';
import { transposeChord, analyzeHarmony, formatMusical } from '../musicUtils.ts';

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
    <div className="flex flex-wrap gap-3 mt-4 items-center">
      {pts.map((p, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-md font-bold border-2 transition-all shadow-md ${
              p.includes('b') || p.includes('#') 
                ? 'bg-slate-800 border-slate-700 text-slate-100' 
                : 'bg-sky-500 border-sky-400 text-black'
            }`}>
              {formatMusical(p)}
            </div>
          </div>
          {i < pts.length - 1 && (
            <div className="mx-2 text-slate-700">
              <i className="fas fa-chevron-right text-[10px] opacity-20"></i>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PracticeMode: React.FC<PracticeModeProps> = ({ tune, transposition }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'chords' | 'tech'>('chords');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const activeSections = useMemo(() => {
    if (tune.variants && tune.variants.length > 0 && tune.variants[selectedVariantIndex]) {
      return tune.variants[selectedVariantIndex].sections;
    }
    return tune.sections;
  }, [tune, selectedVariantIndex]);

  const activePatterns = useMemo(() => {
    const allChords = activeSections.flatMap(s => s.chords);
    return analyzeHarmony(allChords);
  }, [activeSections]);

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
    const tempoVal = typeof tune.tempo === 'number' ? tune.tempo : parseInt(tune.tempo) || 120;
    if (isPlaying) {
      interval = setInterval(() => {
        const totalBeats = activeSections.reduce((acc, s) => acc + s.chords.reduce((bc, c) => bc + c.duration, 0), 0);
        setCurrentBeat((prev) => (prev + 1) % totalBeats);
      }, (60 / tempoVal) * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tune.tempo, activeSections]);

  const loadAiSuggestions = async () => {
    setIsLoadingAi(true);
    const suggestions = await getPracticeSuggestions(tune, transposition);
    setAiSuggestions(suggestions);
    setIsLoadingAi(false);
  };

  const getActivePattern = useMemo(() => {
    return activePatterns.find(p => currentBeat >= p.startBeat && currentBeat < p.endBeat);
  }, [activePatterns, currentBeat]);

  const getPatternForBeat = (beat: number): Pattern | undefined => {
    return activePatterns.find(p => beat >= p.startBeat && beat < p.endBeat);
  };

  const getPatternTheme = (type: PatternType) => {
    switch(type) {
      case 'ii-V-I': return { bg: 'bg-sky-950/20', border: 'border-sky-500/20', accent: 'bg-sky-400', text: 'text-sky-300', scales: 'Dorian → Mixo → Ionian', label: 'Major ii-V-I' };
      case 'minor-ii-V-i': return { bg: 'bg-indigo-950/20', border: 'border-indigo-500/20', accent: 'bg-indigo-400', text: 'text-indigo-300', scales: 'm7b5 → Alt → Melodic m', label: 'Minor ii-V-i' };
      case 'turnaround': return { bg: 'bg-blue-950/20', border: 'border-blue-500/20', accent: 'bg-blue-400', text: 'text-blue-300', scales: 'I-VI-ii-V Cycles', label: 'Turnaround' };
      default: return { bg: 'bg-slate-900/10', border: 'border-slate-800/30', accent: 'bg-transparent', text: 'text-white', scales: '', label: '' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] font-sans relative overflow-hidden">
      <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex flex-row justify-between items-center sticky top-0 z-50 gap-4 shadow-xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/5">
             <i className="fas fa-music text-xl"></i>
           </div>
           <div>
            <h2 className="text-3xl font-jazz text-white leading-none truncate md:max-w-none uppercase">{tune.title}</h2>
            <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400">
              <span className="text-sky-400 font-realbook text-sm lowercase">{tune.composer}</span>
              <span className="opacity-40">|</span>
              <span className="text-white">{formatMusical(transposeChord(tune.key, transposition))}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {tune.variants && tune.variants.length > 0 && (
            <div className="flex bg-black/40 rounded-xl p-1 border border-slate-700 h-10">
              <button
                onClick={() => setSelectedVariantIndex(-1)}
                className={`px-4 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  selectedVariantIndex === -1 ? 'bg-slate-700 text-sky-400 shadow-inner' : 'text-slate-500 hover:text-white'
                }`}
              >Standard</button>
              {tune.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariantIndex(i)}
                  className={`px-4 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    selectedVariantIndex === i ? 'bg-slate-700 text-sky-400 shadow-inner' : 'text-slate-500 hover:text-white'
                  }`}
                >{v.name}</button>
              ))}
            </div>
          )}
          
          <div className="bg-black/40 border border-slate-700 rounded-xl p-1 flex h-10">
            <button 
              onClick={() => setActiveTab('chords')}
              className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'chords' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
            >COMPANION</button>
            <button 
              onClick={() => setActiveTab('tech')}
              className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'tech' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
            >TECHNIQUE</button>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all shadow-xl ${
              isPlaying ? 'bg-slate-800 border-2 border-red-500 text-red-500 animate-pulse' : 'bg-sky-500 text-black'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto pb-48">
          {activeTab === 'chords' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3 space-y-12 animate-in fade-in duration-500 relative">
                {isPlaying && (
                  <div className={`p-4 rounded-2xl border-2 flex justify-between items-center animate-in slide-in-from-top-2 duration-300 shadow-xl transition-all ${getActivePattern ? getPatternTheme(getActivePattern.type).bg : 'bg-slate-900/40 border-slate-800'}`}>
                     <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-black/60 flex items-center justify-center text-white border border-white/5">
                           <i className={`fas ${getActivePattern ? 'fa-lightbulb' : 'fa-info-circle'} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="text-xl font-jazz text-white leading-none">
                            {getActivePattern ? `Context: ${getActivePattern.type} in ${formatMusical(transposeChord(getActivePattern.key, transposition))}` : 'Exploring Standard Harmony'}
                          </h4>
                        </div>
                     </div>
                     {getActivePattern && (
                       <div className="bg-black/60 px-5 py-1.5 rounded-full border border-white/10 hidden md:block">
                          <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">
                            {formatMusical(getPatternTheme(getActivePattern.type).scales)}
                          </span>
                       </div>
                     )}
                  </div>
                )}

                {groupedSections.map((section, sIdx) => (
                  <div key={section.id} className="relative pt-10">
                    <div className="absolute -left-8 top-10 h-full flex flex-col items-center">
                      <span className="text-6xl font-jazz text-slate-800/40 leading-none mb-4 -rotate-90 origin-bottom-left transform translate-y-full tracking-wider">{section.name}</span>
                      <div className="w-[1.5px] flex-1 bg-slate-800/10 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {section.measures.map((measure, mIdx) => {
                        const isCurrentBar = isPlaying && currentBeat >= measure.startBeat && currentBeat < measure.startBeat + 4;
                        const pattern = getPatternForBeat(measure.startBeat);
                        const isPatternStart = pattern && pattern.startBeat === measure.startBeat;
                        const theme = pattern ? getPatternTheme(pattern.type) : { bg: 'bg-slate-900/10', border: 'border-slate-800/30', accent: 'bg-transparent', text: 'text-white', scales: '', label: '' };
                        const chordFontSize = measure.chords.length > 1 ? 'text-2xl lg:text-3xl' : 'text-4xl lg:text-5xl';

                        return (
                          <div key={mIdx} className={`relative h-40 md:h-48 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden shadow-lg ${isCurrentBar ? 'bg-sky-500 border-sky-300 shadow-[0_0_40px_rgba(14,165,233,0.3)] scale-105 z-20' : `${theme.bg} ${theme.border}`}`}>
                            {pattern && <div className={`absolute left-0 top-0 bottom-0 w-2 ${theme.accent} opacity-80 z-10`}></div>}
                            {isPatternStart && (
                               <div className="absolute top-3 left-6 z-20">
                                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-black/80 border border-white/10 ${isCurrentBar ? 'text-black bg-white/20' : theme.text} shadow-xl backdrop-blur-sm`}>
                                    {theme.label} in {formatMusical(transposeChord(pattern.key, transposition))}
                                  </span>
                               </div>
                            )}
                            <div className="flex flex-col items-center justify-center gap-1.5 px-4 w-full relative z-0">
                              {measure.chords.map((chord, cIdx) => (
                                <div key={cIdx} className="w-full flex flex-col items-center">
                                  {cIdx > 0 && <div className={`w-3/4 h-[1px] my-1 opacity-20 ${isCurrentBar ? 'bg-black' : 'bg-slate-500'}`}></div>}
                                  <span className={`${chordFontSize} font-realbook font-bold text-center w-full truncate px-2 ${isCurrentBar ? 'text-black' : 'text-white'}`}>
                                    {formatMusical(transposeChord(chord.symbol, transposition))}
                                  </span>
                                  {chord.roman && !isCurrentBar && <span className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-tighter">{chord.roman}</span>}
                                </div>
                              ))}
                            </div>
                            {isCurrentBar && (
                               <div className="absolute bottom-4 flex gap-2">
                                 {[0, 1, 2, 3].map(beat => (
                                   <div key={beat} className={`w-2 h-2 rounded-full border border-black/20 ${Math.floor(currentBeat % 4) === beat ? 'bg-black scale-125 shadow-md' : 'bg-black/5'}`}></div>
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

              {/* Pedagogy Sidebar */}
              <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                   <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <i className="fas fa-lightbulb text-amber-400"></i>
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-300">Shed Insights</h5>
                   </div>
                   <div className="space-y-6">
                      {tune.practiceTools?.soloingTips?.map((tip, i) => (
                        <div key={i} className="flex gap-4 group">
                           <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40 mt-1.5 group-hover:bg-sky-500 transition-colors"></div>
                           <p className="text-sm font-realbook text-slate-400 leading-relaxed italic">{tip}</p>
                        </div>
                      ))}
                   </div>
                </div>

                {tune.practiceTools?.recommendedLoops && (
                  <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <i className="fas fa-rotate text-sky-400"></i>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-300">Target Loops</h5>
                    </div>
                    <div className="space-y-4">
                        {tune.practiceTools.recommendedLoops.map((loop, i) => (
                          <div key={i} className="p-4 bg-black/40 border border-slate-800 rounded-2xl hover:border-sky-500/40 transition-all group">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{loop.name}</span>
                                <span className="text-[9px] text-slate-600 font-black">Bars {loop.bars[0]}-{loop.bars[1]}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 font-realbook italic group-hover:text-slate-300 transition-colors">{loop.focus}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                   <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                      <i className="fas fa-layer-group text-sky-400 text-xs"></i>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Harmonic Legend</h5>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                         <div className="w-4 h-6 rounded-sm bg-sky-400"></div>
                         <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-wide leading-none">Major ii-V-I</p>
                            <p className="text-[8px] text-slate-500 font-realbook mt-1">Dorian → Mixo → Ionian</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                         <div className="w-4 h-6 rounded-sm bg-indigo-400"></div>
                         <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-wide leading-none">Minor ii-V-i</p>
                            <p className="text-[8px] text-slate-500 font-realbook mt-1">Harmonic Minor / Alt</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-4xl font-jazz text-white">Technique Shed</h3>
                  <span className="text-[10px] text-sky-400 font-realbook bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20 tracking-widest uppercase font-black">
                    {formatMusical(transposition)} DNA Sequences
                  </span>
               </div>
               
               <div className="flex flex-col gap-8">
                  {SCALE_DATA.map((scale, i) => (
                    <div key={i} className="bg-[#0f172a] border border-slate-800 p-8 md:p-10 rounded-[3rem] hover:border-sky-500/30 transition-all group shadow-xl">
                       <div className="flex flex-col gap-6">
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                               <h4 className="text-3xl md:text-4xl font-jazz text-sky-400 mb-2 tracking-wide leading-none">{formatMusical(scale.name)}</h4>
                               <p className="text-slate-100 text-lg font-realbook opacity-70">{formatMusical(scale.description)}</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] border border-slate-800 px-4 py-1 rounded-full w-fit">Concept {i+1}</span>
                          </div>
                          <div className="w-full bg-black/30 p-8 rounded-[2.5rem] border border-slate-900 shadow-inner">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 block border-b border-slate-800/50 pb-2">Melodic Sequence</span>
                            <ScaleDiagram intervals={scale.intervals} />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* AI Shed Oracle Section */}
          <div className="bg-[#0f172a] border-4 border-slate-800 rounded-[3.5rem] p-10 mt-20 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 pointer-events-none text-sky-400">
               <i className="fas fa-crow text-9xl"></i>
            </div>
            <div className="flex flex-row justify-between items-center mb-10 relative z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400">
                  <i className="fas fa-crow text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-4xl font-jazz text-white leading-none">The Oracle</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Harmonic Wisdom</p>
                </div>
              </div>
              <button onClick={loadAiSuggestions} disabled={isLoadingAi} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-sky-500/40 text-sky-400 text-[10px] font-black rounded-full transition-all uppercase tracking-widest shadow-xl active:scale-95">
                {isLoadingAi ? <i className="fas fa-compact-disc fa-spin mr-2"></i> : <i className="fas fa-bolt mr-2"></i>}
                {isLoadingAi ? 'Shedding...' : 'Ask Oracle'}
              </button>
            </div>
            {aiSuggestions ? (
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-slate-800">
                   <p className="text-white text-xl font-realbook leading-relaxed mb-8 border-l-4 border-sky-500/40 pl-6 italic">"{formatMusical(aiSuggestions.strategy)}"</p>
                   <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row gap-6 md:items-center">
                      <div className="bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-xl text-center">
                         <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">The Drill</span>
                         <h4 className="text-white text-lg font-jazz mt-1">{formatMusical(aiSuggestions.drill.title)}</h4>
                      </div>
                      <p className="text-slate-400 text-sm font-realbook leading-relaxed flex-1">{formatMusical(aiSuggestions.drill.description)}</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-700 border-4 border-dashed border-slate-800 rounded-[2.5rem] bg-black/10">
                <i className="fas fa-music text-6xl mb-4 opacity-5"></i>
                <p className="text-xl font-jazz tracking-widest opacity-20 uppercase">Awaiting Harmonic Wisdom</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
