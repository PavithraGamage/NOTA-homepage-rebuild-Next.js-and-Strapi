'use client';

import { useRef, type ComponentProps } from 'react';
import { CINEMATIC, gsap, useGSAP } from '@/lib/animation/gsap';
import { ANCHOR_OFFSETS, SCENES, type SceneName } from '@/lib/animation/scenes';

type SceneProps = ComponentProps<'section'> & { scene: SceneName };

/**
 * A section that runs its scroll scene on large screens without a reduced-motion preference.
 * The markup stays server-rendered; this only attaches the motion. `gsap.matchMedia` sets the
 * scene up when the query starts matching and reverts every tween and ScrollTrigger when it
 * stops (resize below 992px, the OS setting changes, or the component unmounts).
 */
export function Scene({ scene, children, ...props }: SceneProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const media = gsap.matchMedia();
      media.add(CINEMATIC, () => SCENES[scene](section));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} data-anchor-offset={ANCHOR_OFFSETS[scene]} {...props}>
      {children}
    </section>
  );
}
