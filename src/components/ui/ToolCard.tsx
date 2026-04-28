import React, { ReactNode } from 'react';

const colorMap: Record<string, {bg: string, icon: string}> = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',    icon: 'text-blue-600 dark:text-blue-400'    },
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-500/10',  icon: 'text-indigo-600 dark:text-indigo-400'  },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-500/10',  icon: 'text-violet-600 dark:text-violet-400'  },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-500/10',    icon: 'text-teal-600 dark:text-teal-400'    },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-500/10',    icon: 'text-cyan-600 dark:text-cyan-400'    },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-500/10',  icon: 'text-orange-500 dark:text-orange-400'  },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: 'text-amber-600 dark:text-amber-400'   },
  red:     { bg: 'bg-red-50 dark:bg-red-500/10',     icon: 'text-red-500 dark:text-red-400'     },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-500/10',    icon: 'text-rose-500 dark:text-rose-400'    },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-500/10',  icon: 'text-purple-600 dark:text-purple-400'  },
  fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', icon: 'text-fuchsia-600 dark:text-fuchsia-400' },
  slate:   { bg: 'bg-slate-100 dark:bg-slate-500/10',  icon: 'text-slate-600 dark:text-slate-400'   },
  yellow:  { bg: 'bg-yellow-50 dark:bg-yellow-500/10',  icon: 'text-yellow-600 dark:text-yellow-400'  },
};

export interface ToolCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string | null;
  onClick?: () => void;
  color?: string;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ 
  icon, 
  title, 
  description, 
  badge, 
  onClick, 
  color = 'blue',
  className = ''
}) => {
  const parsedColor = Object.keys(colorMap).find(k => color.includes(k)) || 'blue';
  const c = colorMap[parsedColor];
  
  return (
    <div 
      onClick={onClick}
      className={`glass-card dark:glass-card-dark rounded-2xl p-4 sm:p-5 flex flex-col h-full relative group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-700">
            {badge}
          </span>
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 ${c.bg} ${c.icon}`}>
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h3 className="font-syne text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      
      <p className="font-dm-sans text-slate-500 dark:text-slate-400 flex-grow text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>

      <div className="mt-auto opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 font-bold text-sm hidden sm:flex items-center gap-1 text-slate-900 dark:text-white">
        Open tool →
      </div>
    </div>
  );
}
