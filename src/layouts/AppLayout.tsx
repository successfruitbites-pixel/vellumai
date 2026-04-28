import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Wrench, Bot, FolderClosed, User, 
  Moon, Sun, Plus, Crown, FileText, FolderOpen 
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function AppLayout() {
  const { darkMode, toggleDarkMode, isPro } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: <Home size={20} />, activeMatch: '/app' },
    { name: 'Tools', path: '/app/tools', icon: <Wrench size={20} />, activeMatch: '/app/tools' },
    { name: 'AI Assistant', path: '/app/ai', icon: <Bot size={20} />, activeMatch: '/app/ai', badge: !isPro ? 'PRO' : null },
    { name: 'My Files', path: '/app/files', icon: <FolderClosed size={20} />, activeMatch: '/app/files' },
    { name: 'Profile', path: '/app/profile', icon: <User size={20} />, activeMatch: '/app/profile' },
  ];

  const isActive = (path: string, activeMatch: string) => {
    if (activeMatch === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(activeMatch);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-navy selection:bg-brand-primary/30 transition-colors duration-300 flex flex-col md:flex-row font-dm-sans">
      
      {/* MOBILE HEADER (Sticky Top) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 text-slate-600 dark:text-slate-300">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-syne font-bold">V</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 cursor-pointer" onClick={() => navigate('/app/profile')}>
            E
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-64 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-syne font-bold">V</div>
                <span className="font-syne font-bold text-lg dark:text-white">Vellum AI</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive: isMatched }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                      isActive(item.path, item.activeMatch)
                        ? 'bg-blue-50 dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            {!isPro && (
              <div className="p-4 border-t border-slate-100 dark:border-white/10">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-xl p-4 text-black shadow-lg">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Crown size={16} /> Upgrade to Pro
                  </div>
                  <p className="text-xs opacity-80 mb-3">Unlock AI + unlimited tasks</p>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/app/pricing'); }} className="w-full py-1.5 px-3 bg-black/10 hover:bg-black/20 rounded-lg text-sm font-medium transition-colors">
                    View Plans
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-[240px] h-screen bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-100 dark:border-white/10 z-30">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-syne font-bold text-xl shadow-lg shadow-blue-500/20">V</div>
          <span className="font-syne font-extrabold text-xl dark:text-white tracking-tight">Vellum AI</span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, item.activeMatch);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400 border-r-2 border-brand-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`${active ? 'text-brand-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </div>
                {item.name}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/10 text-yellow-600 dark:text-yellow-400 border border-brand-gold/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 space-y-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between px-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Dark Mode</span>
            <button onClick={toggleDarkMode} className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {!isPro && (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-xl p-4 text-black shadow-lg hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate('/app/pricing')}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <Crown size={16} /> Upgrade to Pro
              </div>
              <p className="text-xs opacity-90 mb-3 font-medium">Unlock AI + unlimited tasks</p>
              <button className="w-full py-2 px-3 bg-black/10 hover:bg-black/20 rounded-lg text-sm font-bold transition-colors">
                View Plans
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-[240px] pb-20 lg:pb-0 w-full min-h-screen">
        <div className="max-w-[1280px] mx-auto p-4 md:p-8 w-full">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {[
          { name: 'Home', path: '/app', icon: <Home size={20} />, activeMatch: '/app' },
          { name: 'Tools', path: '/app/tools', icon: <Wrench size={20} />, activeMatch: '/app/tools' },
          { name: 'AI', path: '/app/ai', icon: <Bot size={20} />, activeMatch: '/app/ai' },
          { name: 'Files', path: '/app/files', icon: <FolderOpen size={20} />, activeMatch: '/app/files' },
          { name: 'Profile', path: '/app/profile', icon: <User size={20} />, activeMatch: '/app/profile' },
        ].map((item) => {
          const active = isActive(item.path, item.activeMatch);
          return (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 flex-1 py-1 relative transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium whitespace-nowrap">
                {item.name}
              </span>
              {item.name === 'AI' && isPro && (
                <span className="absolute top-1 right-[20%] w-2 h-2 rounded-full bg-brand-gold border-2 border-white dark:border-slate-900"></span>
              )}
            </NavLink>
          )
        })}
      </nav>

    </div>
  );
}
