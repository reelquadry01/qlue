'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-primary text-background hover:bg-primary-light shadow-lg shadow-primary/20 active:bg-primary-dark',
      success: 'bg-success text-white hover:bg-success-light shadow-lg shadow-success/20 active:bg-success-dark',
      danger: 'bg-danger text-white hover:bg-danger-light shadow-lg shadow-danger/20 active:bg-danger-dark',
      ghost: 'bg-transparent text-foreground-muted hover:text-foreground hover:bg-white/5 active:bg-white/10',
      outline: 'bg-transparent text-foreground border border-white/10 hover:bg-white/5 hover:border-white/15 active:bg-white/8',
      accent: 'bg-accent text-background hover:bg-accent-light shadow-lg shadow-accent/20 active:bg-accent-dark',
    };

    const sizes = {
      sm: 'px-4 py-2.5 text-sm min-h-[40px] gap-1.5',
      md: 'px-5 py-3 text-base min-h-[48px] gap-2',
      lg: 'px-6 py-4 text-lg min-h-[56px] gap-2',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
