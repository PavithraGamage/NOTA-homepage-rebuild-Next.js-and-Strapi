'use client';

import { useEffect } from 'react';
import { CINEMATIC } from '@/lib/animation/media';
import { smoothWheel } from '@/lib/animation/smooth-scroll';

/** Eases wheel scrolling while cinematic mode applies (see `lib/animation/smooth-scroll`). */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia(CINEMATIC);
    let stop: (() => void) | undefined;
    const sync = () => {
      stop?.();
      stop = query.matches ? smoothWheel() : undefined;
    };
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      stop?.();
    };
  }, []);
  return null;
}
