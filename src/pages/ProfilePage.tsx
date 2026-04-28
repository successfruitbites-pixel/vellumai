import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { LogOut, Key, Settings, Moon, Sun, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setUser, clearUser, isPro, darkMode, toggleDarkMode, dailyTaskCount, MAX_FREE_TASKS, clearRecentFiles } = useAppStore();
  const navigate = useNavigate();

  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('vellum_gemini_key');
    if (savedKey) {
      try {
        setGeminiKey(atob(savedKey));
      } catch (e) {
        // failed to decode
      }
    }
  }, []);

  const handleSignIn = () => {
    // Mock login with Google
    setUser({
      name: 'Emmanuel',
      email: 'user@example.com',
      avatar: null,
    });
  };

  const handleSignOut = () => {
    clearUser();
    navigate('/app');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will log you out, clear recent files, and reset settings.')) {
      localStorage.removeItem('vellum-storage');
      localStorage.removeItem('vellum_gemini_key');
      clearUser();
      clearRecentFiles();
      window.location.reload();
    }
  };

  const saveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('vellum_gemini_key', btoa(geminiKey));
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      localStorage.removeItem('vellum_gemini_key');
      setSaveStatus('Key removed.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 animate-in fade-in slide-in-from-bottom-4">
        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 text-brand-primary">
             <span className="font-syne font-bold text-2xl">VM</span>
          </div>
          <h2 className="text-2xl font-bold font-syne dark:text-white mb-2">Sign in to unlock more</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
            Save your history across devices, manage your Pro subscription, and access premium AI features.
          </p>

          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl transition-colors shadow-sm mb-8"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 w-full mb-8">
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <span className="text-sm text-slate-400">or continue as guest</span>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="text-left w-full space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              Sync files across devices
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              Manage subscription
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              Priority support
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="font-syne font-bold text-3xl dark:text-white mb-2">Profile Settings</h1>
      
      {/* Header Profile Info */}
      <GlassCard className="p-8 flex items-center gap-4 sm:gap-6 overflow-hidden">
        {/* Avatar — fixed size, never shrinks */}
        <div className="w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase shrink-0 shadow-lg border-2 border-white dark:border-slate-800 flex-shrink-0">
          {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : getInitials(user.name)}
        </div>

        {/* Name + Email — takes remaining space, truncates if needed */}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold font-syne dark:text-white truncate">
            {user.name || 'User'}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 truncate">
            {user.email || 'No email connected'}
          </p>
        </div>

        {/* Plan badge — fixed, never shrinks or gets clipped */}
        <div className="flex-shrink-0 shrink-0">
          {isPro ? (
            <span className="text-xs font-bold bg-brand-gold text-yellow-900 px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
              <span className="text-xs">⚡</span> PRO
            </span>
          ) : (
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-200 dark:border-slate-600">
              FREE PLAN
            </span>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-brand-primary" size={24} />
            <h3 className="text-lg font-bold dark:text-white">Subscription</h3>
          </div>
          
          {isPro ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2 font-medium">
                   <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                     <Check size={14} strokeWidth={3} />
                   </div>
                   Pro Plan Active
                 </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Your plan automatically renews on {(new Date(Date.now() + 30*24*60*60*1000)).toLocaleDateString()}.</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/app/pricing')}>Manage Subscription</Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">Free Tasks Today: {MAX_FREE_TASKS - dailyTaskCount} remaining</p>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${(dailyTaskCount / MAX_FREE_TASKS) * 100}%` }}></div>
                </div>
              </div>
              <Button variant="gold" onClick={() => navigate('/app/pricing')} className="w-full justify-between group">
                Upgrade to Pro <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Preferences Card */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-brand-primary" size={24} />
            <h3 className="text-lg font-bold dark:text-white">Preferences</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">Appearance</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className="w-14 h-8 bg-slate-100 dark:bg-slate-700 rounded-full p-1 transition-colors relative"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${darkMode ? 'translate-x-6 bg-slate-600 outline outline-1 outline-white/10' : 'translate-x-0 bg-white outline outline-1 outline-black/10 shadow-sm'}`}>
                  {darkMode ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-slate-800" />}
                </div>
              </button>
            </div>

            <div className="space-y-2">
               <p className="font-medium dark:text-white">Default Export Format</p>
               <div className="flex gap-4">
                 {['PDF', 'Word', 'JPG'].map(fmt => (
                   <label key={fmt} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                     <input type="radio" name="format" defaultChecked={fmt === 'PDF'} className="text-brand-primary focus:ring-brand-primary border-slate-300 shadow-sm" />
                     {fmt}
                   </label>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
               <p className="font-medium dark:text-white">Language</p>
               <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 dark:text-white">
                 <option value="en">English</option>
                 <option value="yo">Yorùbá</option>
                 <option value="fr">Français</option>
               </select>
            </div>
          </div>
        </GlassCard>

        {/* API Key Card */}
        <GlassCard className="p-6 md:col-span-2 border-brand-gold/30 bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-800/80">
          <div className="flex items-center gap-3 mb-2">
            <Key className="text-brand-gold" size={24} />
            <h3 className="text-lg font-bold dark:text-white">Connect Your Gemini API Key</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
            Some AI tools may require a personal API key. Your key is stored locally in your browser and never sent to our servers.
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline ml-1">Get a free API key at Google AI Studio.</a>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none dark:text-white transition-all shadow-sm font-mono text-sm"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold"
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <Button variant="secondary" className="border-brand-gold text-brand-gold hover:bg-brand-gold/10" onClick={saveGeminiKey}>
               Save Key
            </Button>
          </div>
          {saveStatus && <p className="text-green-600 dark:text-green-400 text-sm mt-3 font-medium flex items-center gap-1"><Check size={14} />{saveStatus}</p>}
        </GlassCard>

        {/* Account Actions */}
        <div className="md:col-span-2 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
           <button onClick={handleSignOut} className="text-slate-500 hover:text-red-500 font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
             <LogOut size={18} /> Sign Out
           </button>

           <button onClick={handleClearAll} className="text-sm font-medium text-slate-400 hover:underline">
             Clear all local data and reset app
           </button>
        </div>

      </div>
    </div>
  );
}
