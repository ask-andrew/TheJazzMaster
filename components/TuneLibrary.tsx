
import React, { useMemo } from 'react';
import { Tune } from '../types.ts';
import { formatMusical } from '../musicUtils.ts';

interface TuneLibraryProps {
  tunes: Tune[];
  onSelect: (tune: Tune, mode?: 'PRACTICE' | 'STUDY') => void;
  onUpdateMastery: (tuneId: string, mastery: Tune['mastery']) => void;
  selectedTuneId?: string;
}

const TuneLibrary: React.FC<TuneLibraryProps> = ({ tunes, onSelect, onUpdateMastery, selectedTuneId }) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const availableCategories = ['All', ...Array.from(new Set(tunes.map(t => t.category)))];
  
  const filteredTunes = tunes.filter(t => 
    activeCategory === 'All' || t.category === activeCategory
  );

  const priorityTune = useMemo(() => {
    return tunes.find(t => t.mastery === 'Learning') || tunes[0];
  }, [tunes]);

  const masteryLevels: Tune['mastery'][] = ['Learning', 'Familiar', 'Solid', 'Owned'];

  const getMasteryStyles = (mastery: Tune['mastery']) => {
    switch(mastery) {
      case 'Learning': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Familiar': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Solid': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Owned': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h2 className="text-6xl font-jazz text-white leading-none tracking-tight">The Library</h2>
          <p className="text-slate-300 font-realbook mt-3 text-xl">Manage your active repertoire and mastery.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-slate-900/40 px-6 py-3 rounded-2xl border border-slate-800 hidden md:block">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Total Standards: {tunes.length}
            </span>
          </div>
          <div className="bg-sky-500/10 px-6 py-3 rounded-2xl border border-sky-500/20 hidden md:block">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              In Development: {tunes.filter(t => t.mastery === 'Learning').length}
            </span>
          </div>
        </div>
      </div>

      {/* Priority Spotlight */}
      <div className="mb-16 bg-gradient-to-r from-sky-500/10 to-transparent border border-sky-500/20 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 text-sky-500 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
           <i className="fas fa-crown text-9xl"></i>
         </div>
         <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-950 border-4 border-sky-500 flex items-center justify-center flex-shrink-0 animate-[spin_10s_linear_infinite] shadow-[0_0_30px_rgba(14,165,233,0.3)]">
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.2)_0%,_transparent_70%)] flex items-center justify-center">
               <i className="fas fa-record-vinyl text-sky-500 text-4xl"></i>
            </div>
         </div>
         <div className="flex-1 text-center md:text-left">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] mb-3 block">Daily Priority Shed</span>
            <h3 className="text-4xl md:text-5xl font-jazz text-white leading-none mb-4 uppercase">{priorityTune.title}</h3>
            <p className="text-slate-400 font-realbook text-lg italic max-w-xl">"This standard is currently in your 'Learning' phase. Spend 20 minutes here today focusing on guide tone transitions."</p>
         </div>
         <button 
           onClick={() => onSelect(priorityTune, 'PRACTICE')}
           className="px-10 py-5 bg-sky-500 text-black font-jazz text-2xl rounded-[2rem] hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-4"
         >
           Shed Now <i className="fas fa-arrow-right text-sm"></i>
         </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-12">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${
              activeCategory === cat 
                ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.2)]' 
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredTunes.map((tune) => (
          <div 
            key={tune.id}
            className={`group flex flex-col rounded-[3rem] border-2 transition-all duration-300 relative overflow-hidden ${
              selectedTuneId === tune.id 
                ? 'bg-sky-500/10 border-sky-400 shadow-2xl scale-[1.02] z-10' 
                : 'bg-slate-950 border-slate-900 hover:border-slate-700 hover:bg-slate-900/30 shadow-xl'
            }`}
          >
            <div className="p-10 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-2 mb-1">
                     {tune.year && <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">Year {tune.year}</span>}
                     {tune.style && <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded">{tune.style}</span>}
                  </div>
                  <h3 className="text-4xl font-jazz text-white group-hover:text-sky-400 transition-colors leading-none uppercase">
                    {tune.title}
                  </h3>
                  <p className="text-sky-500/60 text-sm mt-2 font-realbook">{tune.composer || 'Standard'}</p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = masteryLevels.indexOf(tune.mastery);
                    const nextIndex = (currentIndex + 1) % masteryLevels.length;
                    onUpdateMastery(tune.id, masteryLevels[nextIndex]);
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${getMasteryStyles(tune.mastery)}`}
                >
                  {tune.mastery}
                </button>
              </div>

              <div className="flex flex-wrap gap-y-4 gap-x-8 text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">
                <span className="flex items-center gap-3">
                  <i className="fas fa-key text-sky-500 opacity-50"></i> {formatMusical(tune.key)}
                </span>
                <span className="flex items-center gap-3">
                  <i className="fas fa-metronome text-sky-500 opacity-50"></i> {tune.tempo} BPM
                </span>
                <span className="flex items-center gap-3">
                  <i className="fas fa-shapes text-sky-500 opacity-50"></i> {tune.form.split(' ')[0]}
                </span>
              </div>

              {tune.realBookPage && (
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-slate-900 pt-4">
                  <i className="fas fa-book-open"></i>
                  <span>Real Book: {tune.realBookPage}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800/50 bg-black/40 rounded-b-[3rem] grid grid-cols-2 gap-4">
              <button 
                onClick={() => onSelect(tune, 'PRACTICE')}
                className="flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-sky-500 hover:text-black rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] border border-slate-800/50 shadow-md"
              >
                <i className="fas fa-play text-[9px]"></i> Practice
              </button>
              <button 
                onClick={() => onSelect(tune, 'STUDY')}
                className="flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-indigo-500 hover:text-white rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] border border-slate-800/50 shadow-md"
              >
                <i className="fas fa-brain text-[9px]"></i> Study
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TuneLibrary;
