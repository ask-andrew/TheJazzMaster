
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tune, PatternType, Transposition, Pattern, Section, Chord } from '../types.ts';
import { getPracticeSuggestions } from '../geminiService.ts';
import { SCALE_DATA } from '../constants.ts';
import { transposeChord, analyzeHarmony, formatMusical, getRecommendedScale, getGuideTones } from '../musicUtils.ts';

interface PracticeModeProps { tune: Tune; transposition: Transposition; }
interface Measure { chords: Chord[]; startBeat: number; }

const ScaleDiagram: React.FC<{ intervals: string }> = ({ intervals }) => {
  const pts = intervals.split(' ');
  return (
    <div className="flex flex-wrap gap-3 mt-4 items-center">
      {pts.map((p, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-md font-bold border-2 transition-all shadow-md ${
              p.includes('b') || p.includes('#') ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-sky-500 border-sky-400 text-black'
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
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [showScaleLayer, setShowScaleLayer] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);

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
    if (tune.variants && tune.variants.length > 0 && tune.variants[selectedVariantIndex]) return tune.variants[selectedVariantIndex].sections;
    return tune.sections;
  }, [tune, selectedVariantIndex]);

  const activePatterns = useMemo(() => analyzeHarmony(activeSections.flatMap(s => s.chords)), [activeSections]);

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
        setCurrentBeat((prev) => {
          const next = (prev + 1) % totalBeats;
          playClick(next % 4);
          return next;
        });
      }, (60 / tempoVal) * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tune.tempo, activeSections, metronomeEnabled]);

  const loadAiSuggestions = async () => {
    setIsLoadingAi(true);
    setAiSuggestions(await getPracticeSuggestions(tune, transposition));
    setIsLoadingAi(false);
  };

  const getActivePattern = useMemo(() => activePatterns.find(p => currentBeat >= p.startBeat && currentBeat < p.endBeat), [activePatterns, currentBeat]);
  const getPatternForBeat = (beat: number): Pattern | undefined => activePatterns.find(p => beat >= p.startBeat && beat < p.endBeat);

  const getPatternTheme = (type: PatternType) => {
    switch(type) {
      case 'ii-V-I': return { bg: 'bg-sky-600/40', border: 'border-sky-400', accent: 'bg-sky-400', text: 'text-sky-300', scales: 'Dorian → Mixo → Ionian', label: 'Major ii-V-I' };
      case 'minor-ii-V-i': return { bg: 'bg-rose-700/40', border: 'border-rose-500', accent: 'bg-rose-400', text: 'text-rose-300', scales: 'm7b5 → Alt → Melodic m', label: 'Minor ii-V-i' };
      case 'turnaround': return { bg: 'bg-indigo-600/40', border: 'border-indigo-400', accent: 'bg-indigo-400', text: 'text-indigo-300', scales: 'I-VI-ii-V Cycles', label: 'Turnaround' };
      default: return { bg: 'bg-slate-900/10', border: 'border-slate-800/30', accent: 'bg-transparent', text: 'text-white', scales: '', label: '' };
    }
  };

  // Determines striking background color based on chord quality for visualization
  const getFunctionalColor = (chord: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-sky-500 border-sky-300 shadow-[0_0_40px_rgba(14,165,233,0.4)]';
    
    const s = chord.toLowerCase();
    if (s.includes('m7b5')) return 'bg-rose-950/40 border-rose-500/30';
    if (s.includes('m7')) return 'bg-sky-950/40 border-sky-500/30';
    if (s.includes('7')) return 'bg-amber-950/40 border-amber-500/30';
    if (s.includes('maj7') || s.includes('6')) return 'bg-emerald-950/40 border-emerald-500/30';
    return 'bg-slate-900/40 border-slate-800';
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] font-sans relative overflow-hidden">
      <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex flex-row justify-between items-center sticky top-0 z-50 gap-4 shadow-xl">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sky-400 transition-all ${isPlaying ? 'bg-sky-500/20 border-sky-400 animate-[pulse_1s_infinite]' : 'bg-sky-500/10 border-sky-500/30'}`}>
             <i className="fas fa-drum text-xl"></i>
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
          <button 
            onClick={() => setShowScaleLayer(!showScaleLayer)}
            className={`px-4 h-10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border ${showScaleLayer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
          >
            <i className={`fas ${showScaleLayer ? 'fa-eye' : 'fa-eye-slash'}`}></i>
            Scale Layer
          </button>
          
          <button onClick={() => setMetronomeEnabled(!metronomeEnabled)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border ${metronomeEnabled ? 'bg-sky-500/20 border-sky-500/40 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`} title="Metronome Audio">
            <i className={`fas ${metronomeEnabled ? 'fa-volume-high' : 'fa-volume-mute'}`}></i>
          </button>
          
          <div className="bg-black/40 border border-slate-700 rounded-xl p-1 flex h-10">
            <button onClick={() => setActiveTab('chords')} className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'chords' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}>COMPANION</button>
            <button onClick={() => setActiveTab('tech')} className={`px-6 text-[10px] font-black rounded-lg transition-all font-jazz tracking-widest ${activeTab === 'tech' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}>TECHNIQUE</button>
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all shadow-xl ${isPlaying ? 'bg-slate-800 border-2 border-red-500 text-red-500' : 'bg-sky-500 text-black'}`}>
            <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto pb-48">
          {activeTab === 'chords' ? (
            <div className="flex flex-col gap-12">
              <div className="space-y-12 animate-in fade-in duration-500 relative w-full">
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
                  </div>
                )}

                {groupedSections.map((section) => (
                  <div key={section.id} className="relative pt-10">
                    <div className="absolute -left-8 top-10 h-full flex flex-col items-center">
                      <span className="text-6xl font-jazz text-slate-800/40 leading-none mb-4 -rotate-90 origin-bottom-left transform translate-y-full tracking-wider">{section.name}</span>
                      <div className="w-[1.5px] flex-1 bg-slate-800/10 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {section.measures.map((measure, mIdx) => {
                        const isCurrentBar = isPlaying && currentBeat >= measure.startBeat && currentBeat < measure.startBeat + 4;
                        const pattern = getPatternForBeat(measure.startBeat);
                        const theme = pattern ? getPatternTheme(pattern.type) : null;
                        
                        return (
                          <div key={mIdx} className={`relative h-40 md:h-52 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden shadow-lg ${theme && !isCurrentBar ? `${theme.bg} ${theme.border}` : getFunctionalColor(measure.chords[0].symbol, isCurrentBar)}`}>
                            {pattern && <div className={`absolute left-0 top-0 bottom-0 w-2 ${getPatternTheme(pattern.type).accent} opacity-80 z-10`}></div>}
                            
                            <div className="flex flex-col items-center justify-center gap-1.5 px-4 w-full relative z-0">
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
                                       <div className="flex gap-4 mt-1 opacity-60">
                                         <div className="flex flex-col items-center">
                                            <span className="text-[7px] uppercase font-black tracking-tighter text-slate-500">3rd</span>
                                            <span className="text-[10px] font-bold text-sky-400">{formatMusical(guideTones.third)}</span>
                                         </div>
                                         <div className="flex flex-col items-center">
                                            <span className="text-[7px] uppercase font-black tracking-tighter text-slate-500">7th</span>
                                            <span className="text-[10px] font-bold text-sky-400">{formatMusical(guideTones.seventh)}</span>
                                         </div>
                                       </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {showScaleLayer && (
                               <div className={`absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center border-t border-black/10 ${isCurrentBar ? 'bg-black/20' : 'bg-black/40'}`}>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrentBar ? 'text-black' : 'text-emerald-400'}`}>
                                    {formatMusical(getRecommendedScale(transposeChord(measure.chords[0].symbol, transposition)))}
                                  </span>
                               </div>
                            )}

                            {isCurrentBar && !showScaleLayer && (
                               <div className="absolute bottom-4 flex gap-2">
                                 {[0, 1, 2, 3].map(beat => <div key={beat} className={`w-2 h-2 rounded-full border border-black/20 ${Math.floor(currentBeat % 4) === beat ? 'bg-black scale-125 shadow-md' : 'bg-black/5'}`}></div>)}
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl h-full transition-all hover:border-sky-500/20">
                   <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
                         <i className="fas fa-lightbulb text-lg"></i>
                      </div>
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-100">Shed Insights</h5>
                   </div>
                   <div className="space-y-8">
                      {tune.practiceTools?.soloingTips?.map((tip, i) => (
                        <div key={i} className="flex gap-6 group">
                           <div className="w-2.5 h-2.5 rounded-full bg-sky-400/60 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.5)] group-hover:bg-sky-400 transition-all"></div>
                           <p className="text-xl md:text-2xl font-realbook text-slate-100 leading-snug tracking-wide italic transition-colors group-hover:text-white">{tip}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl h-full transition-all hover:border-sky-500/20">
                  <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
                         <i className="fas fa-rotate text-lg"></i>
                      </div>
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-100">Target Loops</h5>
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 ml-14">Micro-Repetition Zones</p>
                  {tune.practiceTools?.recommendedLoops && tune.practiceTools.recommendedLoops.length > 0 ? (
                    <div className="space-y-4">
                        {tune.practiceTools.recommendedLoops.map((loop, i) => (
                          <div key={i} className="p-6 bg-black/40 border border-slate-800 rounded-3xl hover:border-sky-500/40 transition-all group cursor-pointer hover:bg-sky-500/5 shadow-inner">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-sky-400 uppercase tracking-widest group-hover:text-sky-300">{loop.name}</span>
                                <span className="text-[10px] text-slate-500 font-black bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">Bars {loop.bars[0]}-{loop.bars[1]}</span>
                             </div>
                             <p className="text-sm text-slate-400 font-realbook italic group-hover:text-slate-200 transition-colors leading-relaxed">{loop.focus}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-black/20 rounded-[2rem] border border-dashed border-slate-800/50 p-8 text-center">
                      <i className="fas fa-rotate text-3xl mb-4 opacity-10"></i>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-2">No custom loops defined</p>
                      <p className="text-[10px] text-slate-700 font-realbook italic">"Target Loops are specific Bar-Ranges recommended for cyclical practice to internalize complex resolutions."</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-4xl font-jazz text-white">Technique Shed</h3>
                  <span className="text-[10px] text-sky-400 font-realbook bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20 tracking-widest uppercase font-black">{formatMusical(transposition)} DNA Sequences</span>
               </div>
               <div className="flex flex-col gap-8">
                  {SCALE_DATA.map((scale, i) => (
                    <div key={i} className="bg-[#0f172a] border border-slate-800 p-8 md:p-10 rounded-[3rem] hover:border-sky-500/30 transition-all group shadow-xl">
                       <div className="flex flex-col gap-6">
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                               <h4 className="text-3xl md:text-4xl font-jazz text-sky-400 mb-2 tracking-wide leading-none">{formatMusical(scale.name)}</h4>
                               <p className="text-slate-100 text-lg font-realbook opacity-70 mb-4">{formatMusical(scale.description)}</p>
                               <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-xl">
                                  <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-1">Rooting Logic</span>
                                  <p className="text-xs text-slate-400 font-realbook italic">
                                    {scale.name.includes('Harmonic') 
                                      ? "Starting note is flexible, but centered on the 'i' of the target key. In a ii-V-i, use this starting on the b9 or 3rd of the V chord for maximum pull."
                                      : "Always visualize the root as your 'home base' anchor. Build vertical stacks from the root before exploring linear pathways."}
                                  </p>
                               </div>
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
