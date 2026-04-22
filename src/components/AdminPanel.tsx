import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { LEAGUE_TEAMS, PLAYER_ROLES } from '../constants';
import { Settings, Shield, Plus, Edit2, Trash2, Save, X, Activity, Users, Database, RefreshCw, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPanel() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [newMatch, setNewMatch] = useState<any>({ teamA: '', teamB: '', status: 'scheduled', scoreA: '0/0', scoreB: '0/0', date: '' });
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const unsubscribeRegs = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeRegs();
      unsubscribeMatches();
    };
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'matches'), {
         ...newMatch,
         date: new Date(newMatch.date || Date.now()),
         createdAt: serverTimestamp()
      });
      setNewMatch({ teamA: '', teamB: '', status: 'scheduled', scoreA: '0/0', scoreB: '0/0', date: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateScore = async (matchId: string, updates: any) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, updates);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMatch = async (id: string) => {
     if(confirm('Are you sure?')) await deleteDoc(doc(db, 'matches', id));
  };

  const seedLeagueData = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      // Seed Teams
      LEAGUE_TEAMS.forEach(team => {
        const teamRef = doc(db, 'teams', team.id);
        batch.set(teamRef, {
          ...team,
          stats: { played: 0, won: 0, lost: 0, points: 0, nrr: 0 },
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      alert('League teams seeded successfully!');
    } catch (error) {
      console.error(error);
      alert('Seeding failed.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl flex items-center justify-between shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-brand-red" size={24} />
            <h3 className="text-2xl font-black uppercase tracking-tighter">Command Center</h3>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticated System Admin Access</p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Settings size={24} className="text-slate-400 opacity-50 animate-spin-slow" />
        </div>
      </div>

      {/* Developer Options Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-brand-slate-border dark:border-slate-800 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <Terminal className="text-brand-red" size={20} />
            <h4 className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Developer Control Panel</h4>
         </div>
         <div className="flex flex-wrap gap-4">
            <button 
              disabled={isSeeding}
              onClick={seedLeagueData}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-sm border border-brand-slate-border dark:border-slate-700"
            >
              <Database size={14} /> {isSeeding ? 'SEEDING...' : 'INIT_DATABASE_TEAMS'}
            </button>
            <button 
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-sm border border-brand-slate-border dark:border-slate-700"
              onClick={() => alert('Feature coming soon: Bulk Data Export')}
            >
              <RefreshCw size={14} /> SYNC_ALL_STATS
            </button>
         </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Match Management */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-brand-slate-border dark:border-slate-800 flex flex-col">
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-slate-border dark:border-slate-800">
              <h4 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 text-slate-400">
                <Activity size={14} className="text-brand-red" /> LIVE_MATCH_CENTER
              </h4>
           </div>

           <form onSubmit={handleCreateMatch} className="grid grid-cols-2 gap-3 mb-10 p-5 bg-brand-slate-bg dark:bg-slate-800/50 rounded-2xl border border-brand-slate-border dark:border-slate-800">
              <div className="col-span-2"><h5 className="text-[10px] uppercase font-black text-slate-400 mb-2">Schedule New Fixture</h5></div>
              <select 
                className="bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-lg p-2.5 text-xs font-bold outline-none"
                value={newMatch.teamA}
                onChange={e => setNewMatch({...newMatch, teamA: e.target.value})}
              >
                <option value="">Home Team</option>
                {LEAGUE_TEAMS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              <select 
                className="bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-lg p-2.5 text-xs font-bold outline-none"
                value={newMatch.teamB}
                onChange={e => setNewMatch({...newMatch, teamB: e.target.value})}
              >
                <option value="">Away Team</option>
                {LEAGUE_TEAMS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              <input 
                type="datetime-local" 
                className="bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold outline-none"
                value={newMatch.date}
                onChange={e => setNewMatch({...newMatch, date: e.target.value})}
              />
              <button type="submit" className="bg-slate-900 text-white rounded-xl p-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Schedule
              </button>
           </form>

           <div className="space-y-4 flex-1">
              {matches.map((match) => (
                <div key={match.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-brand-slate-border dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest">ID:{match.id.slice(-6).toUpperCase()}</span>
                    <button onClick={() => handleDeleteMatch(match.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{match.teamA}</p>
                      <input 
                        className="w-full bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-lg p-2 font-mono text-center text-xs font-bold"
                        value={match.scoreA}
                        onChange={(e) => handleUpdateScore(match.id, { scoreA: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">{match.teamB}</p>
                      <input 
                        className="w-full bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-lg p-2 font-mono text-center text-xs font-bold"
                        value={match.scoreB}
                        onChange={(e) => handleUpdateScore(match.id, { scoreB: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2">
                    <select 
                      className={`rounded-lg p-2 text-[10px] font-black uppercase tracking-widest outline-none border ${match.status === 'live' ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-white dark:bg-slate-900 border-brand-slate-border dark:border-slate-700'}`}
                      value={match.status}
                      onChange={(e) => handleUpdateScore(match.id, { status: e.target.value })}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                    <input 
                      placeholder="Result Status..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-brand-slate-border dark:border-slate-700 rounded-lg p-2 text-[10px] font-bold uppercase tracking-tight italic"
                      value={match.result || ''}
                      onChange={(e) => handleUpdateScore(match.id, { result: e.target.value })}
                    />
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* User / Registration Management */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-brand-slate-border dark:border-slate-800">
           <h4 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mb-8 pb-4 border-b border-brand-slate-border dark:border-slate-800 text-slate-400">
             <Users size={14} className="text-brand-red" /> PLAYER_REGISTRY_LOGS
           </h4>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                  <tr>
                    <th className="p-4 border-b border-brand-slate-border dark:border-slate-800">Player Profile</th>
                    <th className="p-4 border-b border-brand-slate-border dark:border-slate-800 text-center">Identity</th>
                    <th className="p-4 border-b border-brand-slate-border dark:border-slate-800 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registrations.length > 0 ? registrations.map((reg) => (
                    <tr key={reg.id} className="text-xs group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold uppercase tracking-tight">{reg.userName}</p>
                        <p className="text-[9px] text-slate-400 font-mono italic">{reg.playerRole} • {reg.teamId}</p>
                      </td>
                      <td className="p-4 text-center text-[9px] font-mono text-slate-400 uppercase">{reg.userEmail}</td>
                      <td className="p-4 text-center">
                        <select 
                          className={`bg-transparent border border-brand-slate-border dark:border-slate-700 font-black uppercase tracking-tighter text-[9px] rounded px-2 py-1 outline-none ${reg.status === 'paid' ? 'text-emerald-500 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5'}`}
                          value={reg.status}
                          onChange={(e) => handleUpdateScore(reg.id, { status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Approved</option>
                          <option value="failed">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">No Data Stream Available</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </section>
      </div>
    </div>
  );
}

