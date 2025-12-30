
import React from 'react';
import { AppMode, Transposition } from '../types';
import { formatMusical } from '../musicUtils';

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
    { mode: AppMode.LOG, label: 'Journal', icon: 'fa-feather-pointed' },
  ];

  const instruments = [
    { id: 'C', label: 'Concert' },
    { id: 'Bb', label: 'Tenor' },
    { id: 'Eb', label: 'Alto' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-gray-200 overflow-hidden">
      <nav className="w-20 md:w-56 bg-[#080c1d] border-r border-slate-800 flex flex-col items-center md:items-stretch shadow-2xl z-[100]">
        <div className="p-6 pb-8 text-center md:text-left">
          <h1 className="text-3xl font-jazz text-sky-400 leading-none hidden md:block">JazzMaster</h1>
          <div className="md:hidden text-2xl font-jazz text-sky-400">JM</div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 hidden md:block opacity-60">Improv Engine</p>
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
                <span className="hidden md:inline">{inst.label}</span>
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
                  ? 'bg-sky-500/10 text-sky-400 border-sky-400/20' 
                  : 'text-slate-500 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-xl`}></i>
              <span className="ml-3 font-jazz text-lg hidden md:inline tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-900 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Listening</span>
          </div>
          <p className="text-[9px] text-slate-600 font-realbook">the saxshed v1.0</p>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-[#020617] relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
