
import React, { useState } from 'react';
import { Tune } from '../types';

interface TuneLibraryProps {
  tunes: Tune[];
  onSelect: (tune: Tune, mode?: 'PRACTICE' | 'STUDY') => void;
  selectedTuneId?: string;
}

const TuneLibrary: React.FC<TuneLibraryProps> = ({ tunes, onSelect, selectedTuneId }) => {
  const [filterYear, setFilterYear] = useState<1 | 2>(1);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const availableCategories = ['All', ...Array.from(new Set(tunes.map(t => t.category)))];
  
  const filteredTunes = tunes.filter(t => 
    t.year === filterYear && 
    (activeCategory === 'All' || t.category === activeCategory)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h2 className="text-6xl font-jazz text-white leading-none tracking-tight">The Library</h2>
          <p className="text-slate-300 font-realbook mt-3 text-xl">Curated standards for progressive mastery.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-[1.5rem] border border-slate-800 shadow-xl">
          <button 
            onClick={() => setFilterYear(1)}
            className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterYear === 1 ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30' : 'text-slate-400 hover:text-white'}`}
          >Year 1</button>
          <button 
            onClick={() => setFilterYear(2)}
            className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterYear === 2 ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30' : 'text-slate-400 hover:text-white'}`}
          >Year 2</button>
        </div>
      </div>

      {/* Horizontal Category Filter */}
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

      {/* Flat Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredTunes.map((tune) => (
          <div 
            key={tune.id}
            className={`group flex flex-col rounded-[3rem] border-2 transition-all duration-300 relative overflow-hidden ${
              selectedTuneId === tune.id 
                ? 'bg-sky-500/10 border-sky-400 shadow-2xl' 
                : 'bg-slate-950 border-slate-900 hover:border-slate-700 hover:bg-slate-900/30 shadow-xl'
            }`}
          >
            <div className="p-10 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="max-w-[75%]">
                  <h3 className="text-4xl font-jazz text-white group-hover:text-sky-400 transition-colors leading-none">
                    {tune.title}
                  </h3>
                  <p className="text-sky-500/60 text-sm mt-2 font-realbook">{tune.composer || 'Standard'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  tune.mastery === 'Owned' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  tune.mastery === 'Solid' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {tune.mastery}
                </div>
              </div>

              <div className="flex flex-wrap gap-y-4 gap-x-8 text-[11px] font-black uppercase tracking-widest text-slate-300">
                <span className="flex items-center gap-3">
                  <i className="fas fa-key text-sky-500 opacity-50"></i> {tune.key}
                </span>
                <span className="flex items-center gap-3">
                  <i className="fas fa-metronome text-sky-500 opacity-50"></i> {tune.tempo} BPM
                </span>
                <span className="flex items-center gap-3">
                  <i className="fas fa-shapes text-sky-500 opacity-50"></i> {tune.category}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800/50 bg-black/40 rounded-b-[3rem] grid grid-cols-2 gap-4">
              <button 
                onClick={() => onSelect(tune, 'PRACTICE')}
                className="flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-sky-500 hover:text-black rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] border border-slate-800/50"
              >
                <i className="fas fa-play text-[9px]"></i> Practice
              </button>
              <button 
                onClick={() => onSelect(tune, 'STUDY')}
                className="flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-indigo-500 hover:text-white rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] border border-slate-800/50"
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
