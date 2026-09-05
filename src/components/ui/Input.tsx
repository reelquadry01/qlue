import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`
        w-full px-4 py-3 rounded-xl
        bg-surface border border-white/5
        text-foreground placeholder:text-foreground-faint
        text-base font-medium
        focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/20
        transition-all
        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input;
