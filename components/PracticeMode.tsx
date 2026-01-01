
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tune, PatternType, Transposition, Pattern, Section, Chord } from '../types.ts';
import { getPracticeSuggestions } from '../geminiService.ts';
import { SCALE_DATA, SCALE_DEGREES } from '../constants.ts';
import { transposeChord, analyzeHarmony, formatMusical, getRecommendedScale, getGuideTones, getRequiredScales } from '../musicUtils.ts';

interface PracticeModeProps { tune: Tune; transposition: Transposition; }
interface Measure { chords: Chord[]; startBeat: number; index: number; }

const ScaleDNAItem: React.FC<{ scale: typeof SCALE_DEGREES[0], tip?: string }> = ({ scale, tip }) => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:border-sky-500/30 transition-all group overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-3xl font-jazz text-sky-400 tracking-wide leading-none">{scale.name}</h4>
            {tip && <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,1)]"></div>}
          </div>
          <div className="flex flex-wrap gap-2">
            {scale.tags?.map(t => (
              <span key={t} className="text-[8px] font-black text-slate-500 uppercase tracking-tighter border border-slate-800 px-2 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>
        {tip && (
          <div className="bg-sky-500/5 border border-sky-500/20 px-6 py-4 rounded-2xl flex-1 max-w-md">
            <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest block mb-2">Tune Strategy</span>
            <p className="text-md font-realbook text-slate-300 italic">"{tip}"</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {scale.degrees.map((deg, i) => {
          let colorClass = 'bg-slate-900 border-slate-800 text-slate-500';
          if (deg.includes('b')) colorClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
          else if (deg.includes('#')) colorClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
          else if (['3', '6', '7'].includes(deg)) colorClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
          
          return (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-full h-12 rounded-xl flex items-center justify-center font-bold border-2 transition-all ${colorClass} text-sm`}>
                {formatMusical(deg)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PracticeMode: React.FC<PracticeModeProps> = ({ tune, transposition }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [activeTab, setActiveTab] = useState<'chords' | 'tech'>('chords');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(-1);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [showScaleLayer, setShowScaleLayer] = useState(false);
  
  // Dynamic tempo state
  const [customTempo, setCustomTempo] = useState<number>(() => {
    return typeof tune.tempo === 'number' ? tune.tempo : parseInt(tune.tempo as string) || 120;
  });

  const audioCtx = useRef<AudioContext | null>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tuneRequirements = useMemo(() => getRequiredScales(tune), [tune]);

  // Sync tempo when tune changes
  useEffect(() => {
    setCustomTempo(typeof tune.tempo === 'number' ? tune.tempo : parseInt(tune.tempo as string) || 120);
  }, [tune]);

  const playClick = (beat: number) => {
    if (!metronomeEnabled) return;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = beat === 0 ? 1000 : 800;
    envelope.gain.value = 0.15;
    envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(envelope);
    envelope.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const activeSections = useMemo(() => {
    if (selectedVariantIndex >= 0 && tune.variants && tune.variants[selectedVariantIndex]) {
      return tune.variants[selectedVariantIndex].sections;
    }
    return tune.sections;
  }, [tune, selectedVariantIndex]);

  const activePatterns = useMemo(() => analyzeHarmony(activeSections.flatMap(s => s.chords)), [activeSections]);

  const groupedSections = useMemo(() => {
    let globalBeatOffset = 0;
    let measureCounter = 0;
    return activeSections.map(section => {
      const measures: Measure[] = [];
      let currentMeasureChords: Chord[] = [];
      let currentMeasureBeats = 0;
      let measureStartBeat = globalBeatOffset;
      section.chords.forEach((chord) => {
        currentMeasureChords.push(chord);
        currentMeasureBeats += chord.duration;
        if (currentMeasureBeats >= 4) {
          measures.push({ chords: [...currentMeasureChords], startBeat: measureStartBeat, index: measureCounter++ });
          globalBeatOffset += 4;
          measureStartBeat = globalBeatOffset;
          currentMeasureChords = [];
          currentMeasureBeats = 0;
        }
      });
      if (currentMeasureChords.length > 0) {
        measures.push({ chords: currentMeasureChords, startBeat: measureStartBeat, index: measureCounter++ });
        globalBeatOffset += currentMeasureBeats;
      }
      return { ...section, measures };
    });
  }, [activeSections]);

  useEffect(() => {
    if (!isPlaying) return;
    const activeMeasureIndex = groupedSections.flatMap(s => s.measures).find(m => currentBeat >= m.startBeat && currentBeat < m.startBeat + 4)?.index;
    if (activeMeasureIndex !== undefined) {
      const el = measureRefs.current[activeMeasureIndex];
      if (el) {
        if (activeMeasureIndex === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
        else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentBeat, isPlaying, groupedSections]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const totalBeats = activeSections.reduce((acc, s) => acc + s.chords.reduce((bc, c) => bc + c.duration, 0), 0);
        setCurrentBeat((prev) => {
          const next = (prev + 1) % totalBeats;
          playClick(next % 4);
          return next;
        });
      }, (60 / customTempo) * 1000);
    }
    return () => {
      clearInterval(interval);
      if (!isPlaying) setCurrentBeat(0);
    };
  }, [isPlaying, customTempo, activeSections, metronomeEnabled]);

  const getPatternForBeat = (beat: number): Pattern | undefined => activePatterns.find(p => beat >= p.startBeat && beat < p.endBeat);

  const getPatternTheme = (type: PatternType) => {
    switch(type) {
      case 'ii-V-I': return { bg: 'bg-sky-600/40', border: 'border-sky-400', glow: 'shadow-[0_0_30px_rgba(14,165,233,0.2)]', accent: 'bg-sky-400', text: 'text-sky-300', label: 'Major ii-V-I' };
      case 'minor-ii-V-i': return { bg: 'bg-rose-700/40', border: 'border-rose-500', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]', accent: 'bg-rose-400', text: 'text-rose-300', label: 'Minor ii-V-i' };
      case 'turnaround': return { bg: 'bg-indigo-600/40', border: 'border-indigo-400', glow: 'shadow-[0_0_30px_rgba(129,140,248,0.2)]', accent: 'bg-indigo-400', text: 'text-indigo-300', label: 'Turnaround' };
      default: return { bg: 'bg-slate-900/10', border: 'border-slate-800/30', glow: '', accent: 'bg-transparent', text: 'text-white', label: '' };
    }
  };

  const getFunctionalColor = (chord: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-sky-500 border-sky-300 shadow-[0_0_50px_rgba(14,165,233,0.6)] scale-105 z-20';
    const s = chord.toLowerCase();
    if (s.includes('m7b5')) return 'bg-rose-900/50 border-rose-500/50';
    if (s.includes('m7')) return 'bg-sky-900/50 border-sky-500/50';
    if (s.includes('7')) return 'bg-amber-900/50 border-amber-500/50';
    if (s.includes('maj7') || s.includes('6') || s.includes('maj')) return 'bg-emerald-900/50 border-emerald-500/50';
    return 'bg-slate-900 border-slate-800';
  };

  const logSessionMoment = () => {
    const logs = JSON.parse(localStorage.getItem('jazzmaster_logs') || '[]');
    logs.push({ tune: tune.title, time: new Date().toLocaleTimeString(), note: `Working on ${activeTab === 'chords' ? 'Harmony' : 'Technique'} at ${customTempo} BPM` });
    localStorage.setItem('jazzmaster_logs', JSON.stringify(logs));
    alert('Progress logged to Journal!');
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] font-sans relative overflow-hidden">
      <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex flex-row justify-between items-center sticky top-0 z-50 gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sky-400 transition-all ${isPlaying ? 'bg-sky-500/20 border-sky-400 animate-[pulse_1s_infinite]' : 'bg-sky-500/10 border-sky-500/30'}`}>
             <i className="fas fa-drum text-xl"></i>
           </div>
           <div>
            <h2 className="text-3xl font-jazz text-white leading-none uppercase">{tune.title}</h2>
            <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400">
              <span className="text-sky-400 font-realbook text-sm lowercase">{tune.composer}</span>
              <span className="opacity-40">|</span>
              <span className="text-white">{formatMusical(transposeChord(tune.key, transposition))}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowScaleLayer(!showScaleLayer)} className={`px-4 h-10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border ${showScaleLayer ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            <i className="fas fa-microscope text-xs"></i>
            DNA View
          </button>
          
          <button onClick={logSessionMoment} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-sky-400 border border-slate-700 hover:border-sky-500 transition-all">
            <i className="fas fa-feather-pointed"></i>
          </button>

          {/* Tempo Controls */}
          <div className="flex items-center gap-2 bg-black/40 border border-slate-700 rounded-xl px-2 h-10 shadow-inner">
            <button 
              onClick={() => setCustomTempo(prev => Math.max(40, prev - 2))} 
              className="text-slate-500 hover:text-sky-400 p-1 transition-colors active:scale-90"
              title="Slower"
            >
              <i className="fas fa-minus text-[10px]"></i>
            </button>
            <div className="flex flex-col items-center justify-center min-w-[36px]">
              <span className="text-sky-400 font-jazz text-base leading-none">{customTempo}</span>
              <span className="text-[6px] font-black text-slate-500 uppercase tracking-tighter">BPM</span>
            </div>
            <button 
              onClick={() => setCustomTempo(prev => Math.min(300, prev + 2))} 
              className="text-slate-500 hover:text-sky-400 p-1 transition-colors active:scale-90"
              title="Faster"
            >
              <i className="fas fa-plus text-[10px]"></i>
            </button>
          </div>

          <div className="bg-black/40 border border-slate-700 rounded-xl p-1 flex h-10">
            <button onClick={() => setActiveTab('chords')} className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'chords' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>COMPANION</button>
            <button onClick={() => setActiveTab('tech')} className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'tech' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>TECHNIQUE</button>
          </div>
          
          <button onClick={() => setIsPlaying(!isPlaying)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all shadow-xl ${isPlaying ? 'bg-slate-800 border-2 border-red-500 text-red-500 shadow-red-500/20' : 'bg-sky-500 text-black shadow-sky-500/20'}`}>
            <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
        <div className="max-w-6xl mx-auto pb-48">
          {activeTab === 'chords' ? (
            <div className="flex flex-col gap-12">
              <div className="space-y-12 animate-in fade-in duration-500 relative w-full">
                {groupedSections.map((section) => (
                  <div key={section.id} className="relative pt-12">
                    <div className="absolute -left-10 top-12 h-full flex flex-col items-center">
                      <span className="text-6xl font-jazz text-slate-800/20 leading-none mb-4 -rotate-90 origin-bottom-left transform translate-y-full tracking-widest uppercase">{section.name}</span>
                      <div className="w-[1.5px] flex-1 bg-slate-800/10 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {section.measures.map((measure) => {
                        const isCurrentBar = isPlaying && currentBeat >= measure.startBeat && currentBeat < measure.startBeat + 4;
                        const pattern = getPatternForBeat(measure.startBeat);
                        const isPatternStart = pattern && pattern.startBeat === measure.startBeat;
                        const theme = pattern ? getPatternTheme(pattern.type) : null;
                        
                        return (
                          <div 
                            key={measure.index} 
                            ref={(el) => (measureRefs.current[measure.index] = el)}
                            className={`relative h-44 md:h-56 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden shadow-2xl ${theme ? `${theme.bg} ${theme.border} ${theme.glow}` : getFunctionalColor(measure.chords[0].symbol, isCurrentBar)}`}
                          >
                            {pattern && <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${getPatternTheme(pattern.type).accent} opacity-80 z-10`}></div>}
                            
                            {pattern && isPatternStart && (
                               <div className="absolute top-4 left-8 right-8 z-20 flex flex-col items-start">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-black/90 border border-white/10 ${theme?.text} shadow-xl backdrop-blur-sm mb-1.5`}>
                                    {theme?.label} in {formatMusical(transposeChord(pattern.key, transposition))}
                                  </span>
                               </div>
                            )}

                            <div className="flex flex-col items-center justify-center gap-2 px-4 w-full relative z-0">
                              {measure.chords.map((chord, cIdx) => {
                                const transposed = transposeChord(chord.symbol, transposition);
                                const guideTones = getGuideTones(transposed);
                                return (
                                  <div key={cIdx} className="w-full flex flex-col items-center">
                                    {cIdx > 0 && <div className={`w-3/4 h-[1px] my-1 opacity-20 ${isCurrentBar ? 'bg-black' : 'bg-slate-500'}`}></div>}
                                    <span className={`${measure.chords.length > 1 ? 'text-2xl lg:text-3xl' : 'text-4xl lg:text-5xl'} font-realbook font-bold text-center w-full truncate px-2 ${isCurrentBar ? 'text-black' : 'text-white'}`}>
                                      {formatMusical(transposed)}
                                    </span>
                                    {showScaleLayer && !isCurrentBar && (
                                       <div className="flex gap-4 mt-1 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                                         <div className="flex items-center gap-1.5">
                                            <span className="text-[7px] uppercase font-black tracking-tighter text-slate-500">3:</span>
                                            <span className="text-[10px] font-bold text-sky-400">{formatMusical(guideTones.third)}</span>
                                         </div>
                                         <div className="flex items-center gap-1.5">
                                            <span className="text-[7px] uppercase font-black tracking-tighter text-slate-500">7:</span>
                                            <span className="text-[10px] font-bold text-sky-400">{formatMusical(guideTones.seventh)}</span>
                                         </div>
                                       </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className={`absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center border-t border-black/20 ${isCurrentBar ? 'bg-black/20' : 'bg-black/60 shadow-inner'}`}>
                               <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isCurrentBar ? 'text-black' : (showScaleLayer ? 'text-emerald-400' : 'text-slate-500')} transition-colors`}>
                                 {formatMusical(getRecommendedScale(transposeChord(measure.chords[0].symbol, transposition)))}
                               </span>
                            </div>

                            {isCurrentBar && (
                               <div className="absolute top-4 right-6 flex flex-col gap-1 items-center">
                                 {[0, 1, 2, 3].map(beat => <div key={beat} className={`w-1.5 h-1.5 rounded-full border border-black/30 ${Math.floor(currentBeat % 4) === beat ? 'bg-black scale-125' : 'bg-black/10'}`}></div>)}
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl transition-all hover:border-sky-500/20">
                   <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
                         <i className="fas fa-lightbulb text-lg"></i>
                      </div>
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-100">Harmonic Language</h5>
                   </div>
                   <div className="space-y-8">
                      {tune.practiceTools?.soloingTips?.map((tip, i) => (
                        <div key={i} className="flex gap-6 group">
                           <div className="w-3 h-3 rounded-full bg-sky-400/60 mt-2 flex-shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:bg-sky-400 transition-all scale-110"></div>
                           <p className="text-xl md:text-2xl font-realbook text-slate-100 italic transition-colors group-hover:text-white drop-shadow-sm">{tip}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl transition-all hover:border-sky-500/20">
                  <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
                         <i className="fas fa-rotate text-lg"></i>
                      </div>
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-100">Target Loops</h5>
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 ml-14">Cyclical Language Zones</p>
                  {tune.practiceTools?.recommendedLoops && tune.practiceTools.recommendedLoops.length > 0 ? (
                    <div className="space-y-4">
                        {tune.practiceTools.recommendedLoops.map((loop, i) => (
                          <div key={i} className="p-6 bg-black/40 border border-slate-800 rounded-3xl hover:border-sky-500/40 transition-all group cursor-pointer shadow-inner">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-black text-sky-400 uppercase tracking-widest">{loop.name}</span>
                                <span className="text-[10px] text-slate-500 font-black bg-slate-800 px-3 py-1 rounded-full border border-white/5">Bars {loop.bars[0]}-{loop.bars[1]}</span>
                             </div>
                             <p className="text-md text-slate-300 font-realbook italic leading-relaxed">{loop.focus}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-black/20 rounded-[2.5rem] border border-dashed border-slate-800/50 p-8 text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-2">Standard Form Active</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-10">
               <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-4xl font-jazz text-white">The DNA Shed</h3>
                    <p className="text-slate-500 font-realbook mt-2">These are the building blocks specifically required for "{tune.title}".</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[10px] text-sky-400 font-realbook bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20 tracking-widest uppercase font-black h-fit">
                      {formatMusical(transposition)} Instrument
                    </span>
                    <span className="text-[10px] text-amber-400 font-realbook bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 tracking-widest uppercase font-black h-fit">
                      {customTempo} BPM
                    </span>
                  </div>
               </div>
               
               <div className="flex flex-col gap-8">
                  {SCALE_DEGREES.filter(s => tuneRequirements.has(s.name)).map((scale, i) => (
                    <ScaleDNAItem 
                      key={i} 
                      scale={scale} 
                      tip={tuneRequirements.get(scale.name)} 
                    />
                  ))}

                  <div className="mt-12 p-10 bg-black/40 border-2 border-dashed border-slate-800 rounded-[3rem] text-center">
                    <p className="text-lg font-realbook text-slate-600 italic mb-6">"Need more depth? Head to the Study Room for the full Comparative DNA Matrix."</p>
                    <button 
                      onClick={() => (window as any).setActiveMode?.('STUDY')} 
                      className="px-8 py-3 bg-slate-900 border border-slate-700 text-slate-400 font-jazz text-xl rounded-2xl hover:text-white transition-all shadow-xl"
                    >
                      Enter Study Room
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
