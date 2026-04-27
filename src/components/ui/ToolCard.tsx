import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

/**
 * Props for the ToolCard component.
 */
export interface ToolCardProps {
  /** SVG or Emoji icon representing the tool */
  icon: ReactNode;
  /** Title of the tool */
  title: string;
  /** Brief description of the tool */
  description: string;
  /** Optional status badge (e.g., 'New', 'AI', 'Pro') */
  badge?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Tailwind color classes for the icon container. Defaults to blue. */
  color?: string;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * Represents a tool entry as a card in the dashboard grid.
 */
export const ToolCard: React.FC<ToolCardProps> = ({ 
  icon, 
  title, 
  description, 
  badge, 
  onClick, 
  color = 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-blue-400', 
  className = '' 
}) => {
  return (
    <GlassCard variant="light" hover={true} onClick={onClick} className={`p-6 flex flex-col h-full relative group ${className}`}>
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          {badge === 'Pro' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-brand-gold to-yellow-300 text-black shadow-sm">
              Pro
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-blue-300 border border-brand-primary/20">
              {badge}
            </span>
          )}
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 ${color}`}>
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      <h3 className="font-syne text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="font-dm-sans text-slate-500 dark:text-slate-400 flex-grow text-sm leading-relaxed">{description}</p>
    </GlassCard>
  );
};
