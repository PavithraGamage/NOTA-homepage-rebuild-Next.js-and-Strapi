'use client';

import { useEffect, useRef, type ComponentProps } from 'react';
import { ANCHOR_OFFSETS } from '@/lib/animation/anchors';
import { CINEMATIC } from '@/lib/animation/media';
import type { SceneName } from '@/lib/animation/scenes';

type SceneProps = ComponentProps<'section'> & { scene: SceneName };

/**
 * A section that runs its scroll scene on large screens without a reduced-motion preference.
 * The markup stays server-rendered; the motion code (GSAP and the scenes) is only downloaded
 * the first time cinematic mode applies. After that `gsap.matchMedia` follows the query
 * itself (resize, OS setting) and everything is reverted on unmount.
 */
export function Scene({ scene, children, ...props }: SceneProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const query = window.matchMedia(CINEMATIC);
    let cleanup: (() => void) | undefined;
    let unmounted = false;

    const load = () => {
      if (!query.matches) return;
      query.removeEventListener('change', load);
      void import('@/lib/animation/run-scene').then(({ runScene }) => {
        if (!unmounted) cleanup = runScene(scene, section);
      });
    };
    load();
    query.addEventListener('change', load);
    return () => {
      unmounted = true;
      query.removeEventListener('change', load);
      cleanup?.();
    };
  }, [scene]);

  return (
    <section ref={ref} data-anchor-offset={ANCHOR_OFFSETS[scene]} {...props}>
      {children}
    </section>
  );
}
