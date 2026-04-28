import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { 
  FileText, ArrowRight, Zap, Scissors, Minimize2, 
  MessageSquare, Clock, ArrowUpRight, Crown, FileBadge2
} from 'lucide-react';

export default function Dashboard() {
  const { user, isPro, dailyTaskCount, MAX_FREE_TASKS, recentFiles, checkTaskLimit } = useAppStore();
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-xl text-slate-900 dark:text-white">Quick Tools</h2>
          <button 
            onClick={() => navigate('/app/tools')} 
            className="text-sm font-bold text-brand-primary hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Browse All <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'merge', title: 'Merge PDF', desc: 'Combine multiple files', icon: <FileText size={28} />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
            { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size', icon: <Minimize2 size={28} />, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
            { id: 'ai-chat', title: 'AI Chat', desc: 'Chat with any document', icon: <MessageSquare size={28} />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', badge: !isPro ? 'PRO' : null },
            { id: 'split', title: 'Split PDF', desc: 'Extract pages easily', icon: <Scissors size={28} />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
          ].map(tool => (
            <GlassCard 
              key={tool.id} 
              hover 
              className="p-5 flex flex-col group cursor-pointer border border-transparent shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50"
              onClick={() => navigate(`/app/tools/${tool.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${tool.color}`}>
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className="text-[10px] font-bold bg-brand-gold/10 text-yellow-600 dark:text-yellow-400 border border-brand-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {tool.badge}
                  </span>
                )}
                {!tool.badge && (
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={16} />
                  </div>
                )}
              </div>
              <h3 className="font-syne font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors">{tool.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
            </GlassCard>
          ))}
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
