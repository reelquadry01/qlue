'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  active?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, hover = false, active = false, padding = 'md', className = '', ...props }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        glass-card ${paddingClasses[padding]}
        ${hover ? 'cursor-pointer hover:bg-card-hover' : ''}
        ${active ? 'ring-2 ring-primary/30 bg-card-active border-primary/20' : ''}
        transition-all duration-150
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
