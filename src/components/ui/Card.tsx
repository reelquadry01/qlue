'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  active?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, active = false, padding = 'md', className = '', children, ...props }, ref) => {
    let classes = 'glass-card transition-all duration-200';

    const paddings = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    if (hover) {
      classes += ' cursor-pointer hover:bg-card-hover hover:border-foreground-muted/20 hover:scale-[1.01]';
    }

    if (active) {
      classes += ' ring-2 ring-primary border-primary/30 bg-card-active';
    }

    return (
      <div ref={ref} className={`${classes} ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
