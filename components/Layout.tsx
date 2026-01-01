
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-[#020617] text-gray-200 overflow-hidden relative">
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Persistent Drawer Sidebar */}
      <nav className={`fixed inset-y-0 left-0 w-72 bg-[#080c1d] border-r border-slate-800 flex flex-col items-stretch shadow-2xl z-[120] transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-jazz text-sky-400 leading-none">JazzMaster</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 opacity-60">Improv Engine</p>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-slate-500 hover:text-white p-2">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="px-4 mb-8">
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

        <div className="px-5 mb-8">
          <div className="flex flex-col bg-black/40 p-1 rounded-xl gap-1 border border-slate-800">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setTransposition(inst.id as Transposition)}
                className={`w-full text-[10px] font-black py-2 rounded-lg transition-all uppercase tracking-widest ${
                  transposition === inst.id 
                    ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {inst.label} ({formatMusical(inst.id)})
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                setActiveMode(item.mode);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-xl transition-all border-2 ${
                activeMode === item.mode 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-400/20 shadow-[0_0_20px_rgba(14,165,233,0.05)]' 
                  : 'text-slate-500 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-xl`}></i>
              <span className="ml-3 font-jazz text-lg tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-900">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header with Hamburger */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 bg-[#020617]/80 backdrop-blur-md z-[100] shrink-0">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-sky-400 hover:bg-sky-500/10 rounded-xl transition-all mr-4"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="font-jazz text-2xl text-sky-400 tracking-wider">JazzMaster</div>
          <div className="flex-1"></div>
          <div className="bg-sky-500/5 px-4 py-1.5 rounded-full border border-sky-500/20 text-sky-400 font-jazz text-lg">
            {formatTime(sessionTime)}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#020617] relative scroll-smooth">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
