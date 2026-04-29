import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { 
  FileText, ArrowRight, Zap, Scissors, Minimize2, 
  MessageSquare, Clock, ArrowUpRight, Crown, FileBadge2, ScanLine
} from 'lucide-react';

export default function Dashboard() {
  const { user, isPro, dailyTaskCount = 0, MAX_FREE_TASKS = 5, recentFiles = [], checkTaskLimit } = useAppStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const remaining = Math.max(0, MAX_FREE_TASKS - dailyTaskCount);
  const progressPercent = isPro ? 100 : Math.round((remaining / MAX_FREE_TASKS) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -m-4 md:-m-8 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne font-bold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Friend'} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            What would you like to do today?
          </p>
        </div>
        {isPro && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-sm font-bold border border-brand-gold/20">
            <Crown size={16} /> Pro Account Active
          </div>
        )}
      </div>

      {/* FREE USER BANNER */}
      {!isPro && (
        <GlassCard variant="gold" hover className="p-5 flex flex-col md:flex-row items-center justify-between gap-6" onClick={() => navigate('/app/pricing')}>
          <div className="flex-1 w-full relative z-10">
            <h3 className="font-syne font-bold text-lg dark:text-white flex items-center gap-2 mb-1">
              <Zap size={18} className="text-amber-500" />
              You have {remaining} free tasks remaining today.
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Upgrade to Pro for unlimited tasks, AI document chatting, and advanced batch processing.
            </p>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${remaining === 0 ? 'bg-red-500' : 'bg-brand-gold'}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <Button variant="gold" rightIcon={<ArrowRight size={16} />} className="w-full md:w-auto relative z-10">
            Upgrade
          </Button>
        </GlassCard>
      )}

      {/* QUICK TOOLS GRID */}
      <div>
        <h2 className="font-syne font-bold text-xl text-slate-900 dark:text-white mb-4">Quick Tools</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'tools/merge', title: 'Merge PDF', icon: <FileText size={24} />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
            { id: 'tools/compress', title: 'Compress PDF', icon: <Minimize2 size={24} />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
            { id: 'ai', title: 'AI Chat', icon: <MessageSquare size={24} />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
            { id: 'tools/scanner', title: 'Scanner', icon: <ScanLine size={24} />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
          ].map(tool => (
            <div 
              key={tool.id} 
              onClick={() => navigate(`/app/${tool.id}`)}
              className="glass-card dark:glass-card-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${tool.color}`}>
                {tool.icon}
              </div>
              <h3 className="font-syne font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{tool.title}</h3>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <div 
            onClick={() => navigate('/app/tools')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            Browse All 15 Tools →
          </div>
        </div>
      </div>

      {/* RECENT FILES */}
      <div>
        <h2 className="font-syne font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" /> Recent Files
        </h2>
        
        <GlassCard className="overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm">
          {recentFiles.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <FileBadge2 size={32} />
              </div>
              <h3 className="font-syne font-bold text-lg text-slate-900 dark:text-white mb-1">No recent files yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                Your processed files will appear here for easy access. Start by selecting a tool above.
              </p>
              <Button onClick={() => navigate('/app/tools')} variant="secondary">
                Browse Tools
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentFiles.map((file, i) => (
                <div key={i} className="p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 mt-1">
                      <span>{file.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span>Processed with {file.tool}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span>{new Date(file.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Open Again
                  </Button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

    </div>
  );
}
