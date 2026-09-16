'use client';

import { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  active?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Marks the card as a control so it becomes reachable by keyboard and exposes
   * ARIA state. Requires `onClick`.
   */
  control?: 'button' | 'checkbox';
  /** Current state of a `control` card (maps to aria-pressed / aria-checked). */
  checked?: boolean;
  disabled?: boolean;
}

export default function Card({
  children,
  hover = false,
  active = false,
  padding = 'md',
  control,
  checked,
  disabled = false,
  className = '',
  onClick,
  onKeyDown,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const role = control ?? (onClick ? 'button' : undefined);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!role || disabled || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      // Space would otherwise scroll the page.
      event.preventDefault();
      onClick?.(event as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      role={role}
      // Only real controls get a tab stop; presentational cards stay inert.
      tabIndex={role && !disabled ? 0 : undefined}
      aria-checked={role === 'checkbox' ? Boolean(checked) : undefined}
      aria-pressed={role === 'button' && checked !== undefined ? checked : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={role ? handleKeyDown : onKeyDown}
      className={`
        glass-card ${paddingClasses[padding]}
        ${hover && !disabled ? 'cursor-pointer hover:bg-card-hover' : ''}
        ${active ? 'ring-2 ring-primary/30 bg-card-active border-primary/20' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        transition-all duration-150
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

