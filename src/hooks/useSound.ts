'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePreferences } from './usePreferences';

export type SoundType =
  | 'correct'
  | 'skip'
  | 'countdown'
  | 'countdownGo'
  | 'timeUp'
  | 'buttonTap';

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as typeof window & { webkitAudioContext?: AudioContextCtor };
  // Safari (including older iOS) still only exposes the prefixed constructor.
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Sound effects for the whole app.
 *
 * With no argument the hook follows the shared `soundEnabled` preference, so the
 * switch on the home screen, the switch on the game settings screen and the
 * speaker button during play all control the same stored setting. Passing an
 * explicit boolean overrides it for one-off cases.
 */
export function useSound(enabled?: boolean) {
  const { soundEnabled } = usePreferences();
  const effectiveEnabled = enabled ?? soundEnabled;
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      // Closing in a callback avoids the unhandled rejection Safari throws when
      // a suspended context is closed while teardown is in flight.
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx && ctx.state !== 'closed') {
        void ctx.close().catch(() => undefined);
      }
    };
  }, []);

  const getCtx = useCallback(() => {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') {
      // Browsers only allow this after a user gesture; the first play() call
      // always follows a tap, so this resolves on the same interaction.
      void ctxRef.current.resume().catch(() => undefined);
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      if (!effectiveEnabled) return;
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
          case 'correct':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.08);
            osc.frequency.setValueAtTime(784, now + 0.16);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;

          case 'skip':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;

          case 'countdown':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;

          case 'countdownGo':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.1);
            osc.frequency.setValueAtTime(784, now + 0.2);
            osc.frequency.setValueAtTime(1047, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;

          case 'timeUp':
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(150, now + 0.2);
            osc.frequency.setValueAtTime(100, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
            break;

          case 'buttonTap':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
        }
      } catch {
        // Audio is a nice-to-have: never break the game because of it.
      }
    },
    [effectiveEnabled, getCtx]
  );

  /** Pre-warm the audio context from a user gesture (used by "Ready?"). */
  const prime = useCallback(() => {
    getCtx();
  }, [getCtx]);

  return { play, prime, enabled: effectiveEnabled };
}