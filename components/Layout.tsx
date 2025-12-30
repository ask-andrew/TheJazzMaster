
import React from 'react';
import { AppMode, Transposition } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  transposition: Transposition;
  setTransposition: (t: Transposition) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, setActiveMode, transposition, setTransposition }) => {
  const navItems = [
    { mode: AppMode.LIBRARY, label: 'Repertoire', icon: 'fa-record-vinyl' },
    { mode: AppMode.PRACTICE, label: 'Companion', icon: 'fa-compact-disc' },
    { mode: AppMode.STUDY, label: 'Study Room', icon: 'fa-brain' },
    { mode: AppMode.LOG, label: 'Practice Log', icon: 'fa-feather-pointed' },
  ];

  const instruments = [
    { id: 'C', label: 'Concert' },
    { id: 'Bb', label: 'Bb/Tenor' },
    { id: 'Eb', label: 'Eb/Alto' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-24 md:w-64 bg-[#080c1d] border-r border-slate-800 flex flex-col items-center md:items-stretch shadow-2xl z-[100]">
        <div className="p-8 pb-10">
          <h1 className="text-4xl font-jazz text-sky-400 leading-none hidden md:block">JazzMaster</h1>
          <div className="md:hidden text-2xl font-jazz text-sky-400">JM</div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 hidden md:block opacity-80">Improv Engine</p>
        </div>

        {/* Transposition Toggle */}
        <div className="px-6 mb-10">
          <div className="flex md:flex-col bg-black/60 p-1.5 rounded-2xl gap-2 border border-slate-700">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setTransposition(inst.id as Transposition)}
                className={`flex-1 text-[11px] font-black py-3 px-3 rounded-xl transition-all uppercase tracking-widest ${
                  transposition === inst.id 
                    ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setActiveMode(item.mode)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all border-2 ${
                activeMode === item.mode 
                  ? 'bg-sky-500/15 text-sky-400 border-sky-400/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
                  : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-100'
              }`}
            >
              <i className={`fas ${item.icon} w-8 text-center text-2xl`}></i>
              <span className="ml-4 font-jazz text-xl hidden md:inline tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-slate-800">
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
               <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Oracle Listening</span>
            </div>
            <p className="text-[10px] text-slate-500 font-realbook lowercase">built for the gig.</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#020617] relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
