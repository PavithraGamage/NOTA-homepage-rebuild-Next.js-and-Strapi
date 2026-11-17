import { gsap } from './gsap';

/**
 * A scene's timeline, scrubbed by scroll while its stage is pinned. Timeline time is measured
 * in viewport heights of scroll (1 = 100vh), so positions read like the reference timeline in
 * docs/reference-audit.md §1.3. The pinned length comes from the section's `--scene` CSS
 * variable, the same value that sizes the wrapper, so CSS and JS cannot drift apart.
 */
export function sceneTimeline(section: HTMLElement, scrub: boolean | number = true): gsap.core.Timeline {
  const length = sceneLength(section);
  const timeline = gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${sceneLength(section) * window.innerHeight}`,
      scrub,
      invalidateOnRefresh: true,
    },
  });
  timeline.set({}, {}, length);
  return timeline;
}

export function sceneLength(section: HTMLElement): number {
  return parseFloat(getComputedStyle(section).getPropertyValue('--scene')) || 0;
}

/** Elements marked `data-anim="<name>"` inside the scene. */
export function parts<T extends Element = HTMLElement>(root: Element, name: string): T[] {
  return Array.from(root.querySelectorAll<T>(`[data-anim="${name}"]`));
}

export function part<T extends Element = HTMLElement>(root: Element, name: string): T | null {
  return root.querySelector<T>(`[data-anim="${name}"]`);
}
