import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import AdminPanel from './components/AdminPanel';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // New user registration
          const newUser = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            role: 'guest',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newUser);
          setUserData(newUser);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-slate-bg dark:bg-brand-slate-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-900 dark:border-white border-t-brand-red rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System_Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout 
          user={user} 
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={
              user ? <RegistrationForm user={user} /> : (
                <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-brand-slate-border dark:border-slate-800 shadow-xl p-10">
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter text-brand-red">Access Denied</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Authorized clearance required for draft submission. Please authenticate via the secure gateway.</p>
                  <button onClick={handleSignIn} className="w-full bg-slate-900 border border-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-red transition-all shadow-lg">
                    Initialize Google_Auth
                  </button>
                </div>
              )
            } />
            <Route path="/admin" element={
              userData?.role === 'admin' ? <AdminPanel /> : (
                <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-brand-slate-border dark:border-slate-800 shadow-xl p-10">
                  <Shield size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-400">Restricted Protocol</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Administrative privileges not detected</p>
                </div>
              )
            } />
            {/* Added fallback for missing features or admin link in dev */}
            <Route path="/teams" element={<Dashboard />} />
            <Route path="/players" element={<Dashboard />} />
            <Route path="/matches" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          {/* Developer Option / Quick Admin Toggle for demo */}
          <div className="fixed bottom-8 right-8 z-40">
             <a 
               href="/admin" 
               className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-brand-red transition-all flex items-center gap-3 group border border-white/10"
               title="Admin Panel (Dev Only)"
             >
                <Shield size={20} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black text-[10px] uppercase tracking-widest">Admin_Bypass</span>
             </a>
          </div>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
