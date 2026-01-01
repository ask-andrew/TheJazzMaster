
import React, { useState } from 'react';
import { PracticeSession, Pillar } from '../types.ts';
import { analyzePracticeBalance } from '../geminiService.ts';

const PracticeLog: React.FC = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([
    {
      id: '1',
      date: '2023-10-24',
      duration: 60,
      toneTime: 15,
      techniqueTime: 15,
      tunesTime: 20,
      transcriptionsTime: 10,
      notes: 'Focused on long tones and Autumn Leaves bridge.'
    }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await analyzePracticeBalance(sessions);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-5xl font-jazz text-white mb-2">The Shed Journal</h2>
          <p className="text-slate-500 font-realbook">A chronicle of the 4 T's: Tone, Technique, Tunes, Transcriptions.</p>
        </div>
        <button className="px-8 py-3 bg-sky-500 text-black font-jazz text-lg rounded-2xl hover:bg-sky-400 transition-colors shadow-xl shadow-sky-500/10">
          Log Session
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Weekly Stats */}
        <div className="lg:col-span-2 space-y-12">
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

          <div className="bg-[#0f172a] border border-slate-900 rounded-[2rem] overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-900 bg-black/40 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                   <th className="p-6">Date</th>
                   <th className="p-6 text-center">Total</th>
                   <th className="p-6">Main Focus</th>
                   <th className="p-6">Notes</th>
                 </tr>
               </thead>
               <tbody className="font-realbook">
                 {sessions.map((session) => (
                   <tr key={session.id} className="border-b border-slate-900/50 last:border-0 hover:bg-slate-900/10 transition-colors">
                     <td className="p-6 text-slate-300 font-bold">{session.date}</td>
                     <td className="p-6 text-center font-jazz text-2xl text-sky-500/60">{session.duration}m</td>
                     <td className="p-6 text-sm text-sky-500/40">Standards / Linear Logic</td>
                     <td className="p-6 text-xs text-slate-600 italic truncate max-w-xs">{session.notes}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Shed Oracle Feedback */}
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
              <button 
                onClick={getAnalysis}
                disabled={loadingAi}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-sky-400 font-jazz text-xl rounded-2xl transition-all"
              >
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
              <button 
                onClick={() => setAiAnalysis(null)}
                className="w-full py-2 text-[10px] text-slate-800 hover:text-sky-500 font-black uppercase tracking-widest transition-colors"
              >
                Refresh Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeLog;
