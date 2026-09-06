import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] touch-manipulation';

  const variants = {
    primary:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-sm focus:ring-teal-500 border border-teal-700/80 font-bold',
    secondary:
      'bg-slate-100 hover:bg-slate-200/80 text-slate-800 shadow-2xs focus:ring-slate-300 border border-slate-200 font-bold',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs focus:ring-teal-500 hover:border-slate-400 font-semibold',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-rose-700 font-bold',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300 font-semibold',
  };

  const sizes = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] px-4 py-2 text-sm gap-2',
    lg: 'min-h-[48px] px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
