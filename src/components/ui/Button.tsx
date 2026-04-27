import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Props for the Button component.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The styled variant of the button */
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Shows a loading spinner and disables the button if true */
  isLoading?: boolean;
  /** Optional icon to render before the text */
  leftIcon?: ReactNode;
  /** Optional icon to render after the text */
  rightIcon?: ReactNode;
}

/**
 * A reusable Button component with standardized variants for Vellum AI.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    let baseStyles = "inline-flex items-center justify-center font-medium transition-all rounded-xl hover:-translate-y-0.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-brand-primary hover:bg-blue-700 text-white shadow-lg focus:ring-brand-primary",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm focus:ring-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 hover:-translate-y-0 shadow-none focus:ring-slate-500",
      gold: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg hover:shadow-xl focus:ring-amber-400 font-bold",
      danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg focus:ring-red-500"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:-translate-y-0' : ''} ${className}`;

    return (
      <button ref={ref} disabled={disabled || isLoading} className={classes} {...props}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
