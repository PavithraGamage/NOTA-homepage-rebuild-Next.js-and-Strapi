'use client';

import { useEffect, type RefObject } from 'react';
import { CINEMATIC, HERO_SEQUENCE } from '@/lib/animation/media';

/**
 * Header behaviour measured on the reference: it slides away when you scroll down past the
 * opening scene and comes back on any scroll up; its colours follow the section beneath it
 * (`data-header-theme` on sections and stages). Hit-testing the point under the header picks
 * whichever stage is on top, which matters where pinned stages overlap.
 */
export function useHeaderBehaviour(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const cinematic = window.matchMedia(CINEMATIC);
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const hideAfter = (cinematic.matches ? HERO_SEQUENCE : 1) * window.innerHeight;
      if (y > lastY && y > hideAfter) header.dataset.hidden = 'true';
      else if (y < lastY || y <= hideAfter) delete header.dataset.hidden;
      lastY = y;

      const probeY = Math.max(1, header.offsetHeight / 2);
      const under = document.elementsFromPoint(window.innerWidth / 2, probeY).find((el) => !header.contains(el));
      const theme = under?.closest<HTMLElement>('[data-header-theme]')?.dataset.headerTheme;
      if (theme) header.dataset.theme = theme;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}
