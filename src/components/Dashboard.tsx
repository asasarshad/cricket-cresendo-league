import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LEAGUE_TEAMS } from '../constants';
import { Trophy, Activity, Users, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  useEffect(() => {
    const qMatches = query(collection(db, 'matches'), orderBy('date', 'desc'), limit(3));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qTeams = query(collection(db, 'teams'), orderBy('stats.points', 'desc'));
    const unsubscribeTeams = onSnapshot(qTeams, (snapshot) => {
      setStandings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeMatches();
      unsubscribeTeams();
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
           { label: 'Total Players', value: '156', trend: '+12 Syncing...', color: 'text-slate-900 dark:text-white' },
           { label: 'Active Teams', value: '6 / 6', trend: 'Capacity Reached', color: 'text-slate-900 dark:text-white' },
           { label: 'Match Center', value: 'Live', trend: 'Gateway: Active', color: 'text-emerald-600' },
           { label: 'Live Viewers', value: '1.2k', trend: '● Streaming', color: 'text-brand-red animate-pulse' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-brand-slate-border dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold mt-1 text-slate-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Match Main Widget */}
        <div className="lg:col-span-2 space-y-8">
          <section className="match-card-dark min-h-[350px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Standard Match Center</h3>
                <p className="text-sm font-semibold text-white/60">International Stadium, Venue 01</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Live: Match 24</span>
              </div>
            </div>

            <div className="flex justify-between items-center px-4 md:px-12">
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:scale-105 transition-transform">
                   <span className="text-xl md:text-3xl font-black tracking-tighter">BT</span>
                </div>
                <h4 className="font-bold text-xs md:text-sm uppercase tracking-widest">Blue Thunder</h4>
                <p className="text-2xl md:text-4xl font-black mt-2">164/4</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-1">(18.2 OVERS)</p>
              </div>

              <div className="text-white/20 font-black text-xl md:text-4xl italic tracking-tighter">VS</div>

              <div className="text-center opacity-40">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                   <span className="text-xl md:text-3xl font-black tracking-tighter">PS</span>
                </div>
                <h4 className="font-bold text-xs md:text-sm uppercase tracking-widest">Power Strikers</h4>
                <p className="text-2xl md:text-4xl font-black mt-2">YTB</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-1">INNINGS 2</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest mb-3">
                <span className="text-slate-400">Match Event Stream</span>
                <span className="text-emerald-400 flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Stream Sync Active</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-white/90"><span className="text-red-500">[14:42]</span> SIX! Clean strike over deep mid-wicket. Crowd erupts!</p>
                <p className="text-white/40"><span className="text-slate-600">[14:38]</span> WICKET! S. Sharma caught by J. Bairstow.</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.filter(m => m.status !== 'live').slice(0, 2).map((match) => (
              <div key={match.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-slate-border dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] uppercase font-black tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {match.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">#RES_{match.id.slice(-4).toUpperCase()}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider">{match.teamA}</span>
                    <span className="font-mono font-bold">{match.scoreA}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider">{match.teamB}</span>
                    <span className="font-mono font-bold">{match.scoreB}</span>
                  </div>
                </div>
                {match.result && (
                  <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-brand-red tracking-widest">{match.result}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-slate-border dark:border-slate-800 p-6 flex flex-col shadow-sm">
            <h3 className="text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">League Standings</h3>
            <div className="space-y-2 overflow-hidden mb-6">
              {(standings.length > 0 ? standings : LEAGUE_TEAMS).map((team: any, idx) => (
                <div key={team.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${idx === 0 ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20' : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent'}`}>
                   <div className="flex items-center gap-3">
                     <span className={`font-black text-[10px] w-4 ${idx === 0 ? 'text-brand-red' : 'text-slate-400'}`}>{idx + 1}.</span>
                     <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[140px]">{team.name}</span>
                   </div>
                   <span className={`text-[10px] font-black ${idx === 0 ? 'text-brand-red' : 'text-slate-600'}`}>{team.stats?.points || 0} PTS</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg active:scale-95">
              Generate Season Report
            </button>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group border border-white/10">
            <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none">JOIN THE<br />ELITE</h4>
            <p className="text-[10px] opacity-60 uppercase tracking-widest mb-8">Draft Registry: Open for Season 2</p>
            <a href="/register" className="inline-block bg-brand-red text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl">
              Register Now
            </a>
          </div>

          <div className="flex justify-between px-2">
            <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              SYSTEM_VER: 2.0.4-REL
            </div>
            <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              PORT: 8080 // SEC_MODE_ON
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
