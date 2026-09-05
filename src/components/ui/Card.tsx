'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  active?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, active = false, className = '', children, ...props }, ref) => {
    let classes = 'glass-card p-4 transition-all duration-200';

    if (hover) {
      classes += ' cursor-pointer hover:bg-card-hover hover:scale-[1.02]';
    }

    if (active) {
      classes += ' ring-2 ring-primary bg-primary/10';
    }

    return (
      <div ref={ref} className={`${classes} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
