import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Trophy, LayoutDashboard, Ticket, Users, BarChart3, Bell, Moon, Sun, Shield, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onSignOut: () => void;
  onSignIn: () => void;
}

export default function Layout({ children, user, onSignOut, onSignIn }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = window.location.pathname;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Teams & Rosters', icon: Trophy, path: '/teams' },
    { name: 'Player Registry', icon: Users, path: '/players' },
    { name: 'Match Center', icon: BarChart3, path: '/matches' },
    { name: 'Registrations', icon: Ticket, path: '/register' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-slate-bg dark:bg-brand-slate-dark transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 flex-shrink-0 sticky top-0 h-screen border-r border-slate-800">
        <div className="p-6 bg-brand-red text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          CRESCENDO LEAGUE
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg font-semibold ${
                  isActive ? 'nav-active-border' : 'text-slate-400 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'light' ? 'DARK_MODE' : 'LIGHT_MODE'}</span>
            </div>
          </button>
          
          {user ? (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-[10px] font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-200 truncate">{user.email}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">Active Member</p>
                </div>
              </div>
              <button 
                onClick={onSignOut} 
                className="w-full py-2 bg-slate-700/50 hover:bg-red-900/30 text-slate-400 hover:text-red-500 text-[10px] font-bold rounded transition-colors uppercase"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-brand-red-light transition-all uppercase text-xs tracking-widest"
            >
              System Login
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 rounded border border-emerald-500/30">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            ACL_ACTIVE: ON
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-red rounded-full"></div>
          <span className="font-bold tracking-tight uppercase">Crescendo</span>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-brand-slate-border dark:border-slate-800 px-8 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">League Dashboard</h1>
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">Live Season 2.0</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Member Status</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{user ? 'Authorized Access' : 'Public Observer'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full border-2 border-brand-red overflow-hidden flex items-center justify-center">
              {user ? <UserIcon size={20} className="text-slate-500" /> : <Shield size={20} className="text-slate-400" />}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-brand-slate-bg dark:bg-brand-slate-dark">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-slate-900 text-white md:hidden"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <span className="font-bold text-xl">MENU</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
              </div>
              <nav className="flex flex-col gap-6 text-2xl font-bold">
                {navItems.map((item) => (
                  <a key={item.name} href={item.path} className="flex items-center gap-4 hover:text-brand-red transition-colors">
                    <item.icon size={28} />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
