import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LEAGUE_TEAMS, PLAYER_ROLES } from '../constants';
import { CreditCard, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegistrationForm({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    teamId: '',
    role: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to register.');
    
    setIsSubmitting(true);
    try {
      // 1. Create a registration record in Firestore
      const regRef = await addDoc(collection(db, 'registrations'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: formData.email,
        phone: formData.phone,
        teamId: formData.teamId,
        playerRole: formData.role,
        amount: 25.00, // Example fee
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 2. Call our backend to get a Stripe session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          registrationId: regRef.id,
          items: [{
            price_data: {
              currency: 'usd',
              product_data: { name: `Cricket Crescendo League Registration - ${formData.name}` },
              unit_amount: 2500, // $25.00
            },
            quantity: 1,
          }],
        }),
      });

      const session = await response.json();
      
      // In a real app, we would redirect:
      // window.location.href = session.url;
      
      // For this demo/preview, we'll simulate the success
      console.log('Stripe Session Created:', session.id);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-4">Registration Initiated!</h3>
        <p className="text-gray-500 mb-8">We've redirected you to the payment gateway. Once payment is confirmed, your profile will be active in the league.</p>
        <button onClick={() => setIsSuccess(false)} className="text-brand-red font-bold hover:underline underline-offset-4">Register Another Player</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-brand-slate-border dark:border-slate-800">
      <div className="p-8 md:p-16 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Entry Portal</span>
          </div>
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
            League<br /><span className="text-brand-red">Registry</span>
          </h3>
          <p className="text-slate-400 font-medium mb-10 text-sm leading-relaxed">Submit your professional profile to the Cricket Crescendo League draft board. All applications are subject to administrator review.</p>
          
          <ul className="space-y-5">
             {['Professional Stats Tracking', 'Official Team Profile', 'Player ID Card', 'Tournament Insurance'].map((item) => (
               <li key={item} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-100">
                  <div className="w-5 h-5 rounded-full bg-brand-red/20 flex items-center justify-center">
                    <CheckCircle2 className="text-brand-red" size={12} />
                  </div>
                  <span>{item}</span>
               </li>
             ))}
          </ul>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Draft Selection Status</p>
          <p className="text-4xl font-black italic tracking-tighter">OPEN_SEASON_2</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-8 bg-brand-slate-bg dark:bg-slate-900">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Professional Identity</label>
          <input
            required
            type="text"
            placeholder="Enter Full Legal Name"
            className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-slate-border dark:border-slate-700 focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Verified Email</label>
            <input
              required
              type="email"
              className="w-full bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-brand-slate-border dark:border-slate-700 text-slate-400 text-sm font-bold"
              value={formData.email}
              disabled
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Contact Line</label>
            <input
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-slate-border dark:border-slate-700 focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Assigned Franchise</label>
            <select
              required
              className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-slate-border dark:border-slate-700 focus:ring-2 focus:ring-brand-red outline-none text-sm font-bold"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              <option value="">Select Franchise</option>
              {LEAGUE_TEAMS.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Field Specialization</label>
            <select
              required
              className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-slate-border dark:border-slate-700 focus:ring-2 focus:ring-brand-red outline-none text-sm font-bold"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="">Select Specialization</option>
              {PLAYER_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-brand-red text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 text-xs active:scale-95"
        >
          {isSubmitting ? 'PROCESSING_REQUEST...' : <><Send size={16} /> SUBMIT_REGISTRY</>}
        </button>
        
        <p className="text-[9px] text-center text-slate-400 px-8 uppercase font-black tracking-widest leading-loose">
          Authorized verification: By submitting, you acknowledge system-wide security compliance and league conduct protocols.
        </p>
      </form>
    </div>
  );
}
