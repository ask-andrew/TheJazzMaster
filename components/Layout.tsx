
import React, { useState, useEffect } from 'react';
import { AppMode, Transposition } from '../types.ts';
import { formatMusical } from '../musicUtils.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  transposition: Transposition;
  setTransposition: (t: Transposition) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, setActiveMode, transposition, setTransposition }) => {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { mode: AppMode.LIBRARY, label: 'Repertoire', icon: 'fa-record-vinyl' },
    { mode: AppMode.PRACTICE, label: 'Companion', icon: 'fa-compact-disc' },
    { mode: AppMode.STUDY, label: 'Study Room', icon: 'fa-brain' },
    { mode: AppMode.LOG, label: 'Journal', icon: 'fa-feather-pointed' },
  ];

  const instruments = [
    { id: 'C', label: 'Concert' },
    { id: 'Bb', label: 'Tenor' },
    { id: 'Eb', label: 'Alto' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-gray-200 overflow-hidden">
      <nav className="w-20 md:w-64 bg-[#080c1d] border-r border-slate-800 flex flex-col items-center md:items-stretch shadow-2xl z-[100]">
        <div className="p-6 pb-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-jazz text-sky-400 leading-none hidden md:block">JazzMaster</h1>
            <div className="md:hidden text-2xl font-jazz text-sky-400">JM</div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 hidden md:block opacity-60">Improv Engine</p>
        </div>

        <div className="px-4 mb-8 hidden md:block">
          <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In The Shed</span>
              <span className="text-sky-400 font-jazz text-lg">{formatTime(sessionTime)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full animate-[pulse_2s_infinite]" style={{ width: `${Math.min((sessionTime / 3600) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="px-3 md:px-5 mb-8">
          <div className="flex md:flex-col bg-black/40 p-1 rounded-xl gap-1 border border-slate-800">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setTransposition(inst.id as Transposition)}
                className={`flex-1 text-[9px] md:text-[10px] font-black py-2 rounded-lg transition-all uppercase tracking-widest ${
                  transposition === inst.id 
                    ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <span className="md:hidden">{formatMusical(inst.id)}</span>
                <span className="hidden md:inline">{inst.label} ({formatMusical(inst.id)})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setActiveMode(item.mode)}
              className={`w-full flex items-center justify-center md:justify-start p-3 rounded-xl transition-all border-2 ${
                activeMode === item.mode 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-400/20 shadow-[0_0_20px_rgba(14,165,233,0.05)]' 
                  : 'text-slate-500 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-xl`}></i>
              <span className="ml-3 font-jazz text-lg hidden md:inline tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-900 hidden md:block">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">The 4 T's Method</h4>
          <div className="grid grid-cols-2 gap-2">
             {['Tone', 'Tech', 'Tunes', 'Transcription'].map(t => (
               <div key={t} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-bold text-slate-500 text-center uppercase tracking-tighter">
                 {t}
               </div>
             ))}
          </div>
          <p className="text-[9px] text-slate-700 font-realbook mt-6 text-center italic">v1.1 "The Bebop Release"</p>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-[#020617] relative scroll-smooth">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
