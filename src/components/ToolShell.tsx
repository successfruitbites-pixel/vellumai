import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface ToolShellProps {
  toolId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
}

export const ToolShell: React.FC<ToolShellProps> = ({ 
  title, 
  description, 
  icon, 
  accentColor, 
  children 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
        <Link to="/app" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/app/tools" className="hover:text-blue-600 transition-colors">Tools</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-white">{title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex flex-shrink-0 items-center justify-center ${accentColor} shadow-lg shadow-black/5`}>
          {icon}
        </div>
        <div>
          <h1 className="font-syne font-extrabold text-3xl text-slate-900 dark:text-white mb-2">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="mb-12">
        {children}
      </div>

      {/* How it works & Privacy */}
      <div className="mt-16 border-t border-slate-200 dark:border-white/10 pt-12 text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-syne font-bold text-lg dark:text-white mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              { step: 1, text: 'Upload your file securely to the browser.' },
              { step: 2, text: 'Configure settings and process the document.' },
              { step: 3, text: 'Download the compiled result instantly.' }
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {item.step}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-center h-full">
          <GlassCard className="p-4 inline-flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-500/5 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">100% Secure & Private</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Files are processed locally in your browser.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
