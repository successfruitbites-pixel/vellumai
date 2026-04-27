import React, { HTMLAttributes } from 'react';

/**
 * Props for the GlassCard wrapper component.
 */
export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The style variant of the glass card */
  variant?: 'light' | 'dark' | 'gold';
  /** If true, adds a lift animation and shadow on hover */
  hover?: boolean;
}

/**
 * A highly reusable frosted glass surface container.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', variant = 'light', hover = false, children, ...props }, ref) => {
    
    // Core structure
    const baseClasses = "backdrop-blur-xl rounded-2xl overflow-hidden";
    
    // Style variations based on requested behaviors
    const variants = {
      light: "bg-white/70 border border-white/50 shadow-glass dark:bg-slate-900/70 dark:border-white/10 dark:shadow-2xl",
      dark: "bg-slate-900/70 border border-white/10 shadow-2xl",
      gold: "bg-white/70 border border-brand-gold/30 shadow-glass dark:bg-slate-900/70 dark:border-brand-gold/20"
    };
    
    // Hover interactions
    const hoverClasses = hover ? "hover:-translate-y-1 hover:shadow-2xl cursor-pointer transition-all duration-300" : "";
    const goldHoverClasses = (hover && variant === 'gold') ? "hover:shadow-amber-500/20" : "";

    const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${goldHoverClasses} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
