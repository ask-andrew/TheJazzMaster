
import React, { useState, useEffect } from 'react';
import { PracticeSession, Pillar } from '../types.ts';
import { analyzePracticeBalance } from '../geminiService.ts';

const PracticeLog: React.FC = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      toneTime: 15,
      techniqueTime: 15,
      tunesTime: 20,
      transcriptionsTime: 10,
      notes: 'Initial session data.'
    }
  ]);
  const [quickLogs, setQuickLogs] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('jazzmaster_logs') || '[]');
    setQuickLogs(saved);
  }, []);

  const getAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await analyzePracticeBalance(sessions);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const clearQuickLogs = () => {
    localStorage.removeItem('jazzmaster_logs');
    setQuickLogs([]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-5xl font-jazz text-white mb-2">The Shed Journal</h2>
          <p className="text-slate-500 font-realbook">A chronicle of the 4 T's & Your Quick Shed Logs.</p>
        </div>
        <button className="px-8 py-3 bg-sky-500 text-black font-jazz text-lg rounded-2xl hover:bg-sky-400 transition-colors shadow-xl shadow-sky-500/10">
          Manual Log
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Quick Logs Section */}
          <div className="bg-[#0f172a] border border-slate-900 rounded-[2rem] overflow-hidden shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-jazz text-sky-400">Quick Moments</h3>
               <button onClick={clearQuickLogs} className="text-[9px] font-black uppercase text-slate-700 hover:text-red-400 transition-colors">Clear All</button>
            </div>
            {quickLogs.length > 0 ? (
               <div className="space-y-4">
                 {quickLogs.reverse().map((log, i) => (
                   <div key={i} className="bg-black/40 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                     <div>
                       <span className="text-xs font-black text-white block uppercase">{log.tune}</span>
                       <span className="text-[10px] text-slate-500 font-realbook italic">{log.note}</span>
                     </div>
                     <span className="text-[10px] font-jazz text-sky-500/60">{log.time}</span>
                   </div>
                 ))}
               </div>
            ) : (
              <p className="text-center py-8 text-slate-700 font-realbook italic text-sm">"No quick logs yet. Tap the feather icon in Companion mode to log a moment."</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { pillar: Pillar.TONE, color: 'text-blue-500', time: sessions.reduce((a, s) => a + s.toneTime, 0) },
              { pillar: Pillar.TECHNIQUE, color: 'text-sky-500', time: sessions.reduce((a, s) => a + s.techniqueTime, 0) },
              { pillar: Pillar.TUNES, color: 'text-indigo-500', time: sessions.reduce((a, s) => a + s.tunesTime, 0) },
              { pillar: Pillar.TRANSCRIPTIONS, color: 'text-cyan-500', time: sessions.reduce((a, s) => a + s.transcriptionsTime, 0) },
            ].map((p, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-900 p-8 rounded-[2rem] shadow-xl">
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] mb-4">{p.pillar}</p>
                <p className={`text-5xl font-jazz ${p.color}`}>{p.time}<span className="text-xs font-normal text-slate-700 ml-1">m</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 h-fit sticky top-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
               <i className="fas fa-hat-cowboy"></i>
            </div>
            <div>
              <h3 className="text-2xl font-jazz text-white leading-none">Oracle Feedback</h3>
              <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1">Shed analysis</p>
            </div>
          </div>

          {!aiAnalysis ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-600 mb-10 font-realbook">Feed the Oracle your logs for some grizzled veteran advice.</p>
              <button onClick={getAnalysis} disabled={loadingAi} className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-sky-400 font-jazz text-xl rounded-2xl transition-all">
                {loadingAi ? 'Analyzing...' : 'Hear the Truth'}
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <p className="text-lg text-slate-400 leading-relaxed italic border-l-2 border-sky-500/30 pl-6 font-realbook">
                "{aiAnalysis.analysis}"
              </p>
              <div className="space-y-4">
                {aiAnalysis.coachingPoints.map((point: string, i: number) => (
                  <div key={i} className="flex gap-4 text-sm text-slate-500 bg-black/40 p-5 rounded-2xl border border-slate-900/50">
                    <i className="fas fa-ghost text-sky-500/40 mt-1"></i>
                    <span className="font-realbook">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeLog;
