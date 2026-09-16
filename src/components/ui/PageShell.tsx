'use client';

import { ReactNode } from 'react';
import BackButton from './BackButton';

interface PageShellProps {
  title: string;
  subtitle?: string;
  /**
   * Where the back button goes. Pass `null` to hide it, or omit it to use the
   * browser history.
   */
  backHref?: string | null;
  children: ReactNode;
  /** Bottom action area, kept visible while long lists scroll. */
  footer?: ReactNode;
  /** `lg` gives list-heavy screens more room on tablets and desktops. */
  width?: 'md' | 'lg';
}

/**
 * Shared scaffold for the setup and browsing screens: safe areas, ambient
 * background, heading, scrollable body and a pinned action area. Centralising
 * this is what keeps every screen consistent on phones, tablets and desktop.
 */
export default function PageShell({
  title,
  subtitle,
  backHref,
  children,
  footer,
  width = 'md',
}: PageShellProps) {
  return (
    <div className="flex-1 flex flex-col safe-area-top safe-area-bottom relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[420px] h-[420px] rounded-full bg-primary/[0.05] blur-[110px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[320px] h-[320px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div
        className={`relative z-10 flex-1 flex flex-col w-full mx-auto px-5 py-6 sm:px-8 sm:py-10 ${
          width === 'lg' ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        {backHref !== null && <BackButton href={backHref} />}

        <header className="mt-5 mb-6 sm:mt-8 sm:mb-8">
          <h1 className="text-title sm:text-[2rem]">{title}</h1>
          {subtitle && (
            <p className="text-body text-foreground-muted mt-1 text-balance">
              {subtitle}
            </p>
          )}
        </header>

        <div className="flex-1 flex flex-col min-h-0">{children}</div>

        {footer && (
          <div className="mt-auto pt-6 sticky bottom-0 pb-1 bg-gradient-to-t from-background via-background/95 to-transparent">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}