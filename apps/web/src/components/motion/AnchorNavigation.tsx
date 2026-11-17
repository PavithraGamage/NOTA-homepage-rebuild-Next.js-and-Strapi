'use client';

import { useEffect } from 'react';
import { CINEMATIC } from '@/lib/animation/media';

/**
 * In cinematic mode, in-page links jump straight to a set point inside the target scene (as
 * the reference does) instead of smooth-scrolling through every pinned scene on the way. Each
 * scene says where via `data-anchor-offset`, in viewport heights from its top. Elsewhere the
 * browser's own smooth scrolling handles the links.
 */
export function AnchorNavigation() {
  useEffect(() => {
    const cinematic = window.matchMedia(CINEMATIC);
    const onClick = (event: MouseEvent) => {
      if (!cinematic.matches || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!link || !target) return;
      event.preventDefault();
      let top = 0;
      for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null)
        top += node.offsetTop;
      const offset = Number(target.dataset.anchorOffset ?? 0) * window.innerHeight;
      window.scrollTo({ top: top + offset, behavior: 'instant' });
      history.pushState(null, '', link.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
