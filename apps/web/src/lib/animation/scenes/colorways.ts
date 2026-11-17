import { setProgress } from '@/components/ui/Progress';
import { gsap } from '../gsap';
import { part, parts, sceneTimeline } from '../timeline';

/** Cross-fades between the intro and the colourways (viewport heights, measured at 1440×900). */
const CHANGES = [
  [0.26, 0.59],
  [0.93, 1.12],
  [1.43, 1.59],
  [1.93, 2.15],
] as const;

/**
 * Colorways: the stage pins; each colourway's image fades in over the previous one while the
 * copy cross-fades, and the progress bar follows. When the pin ends the stage scrolls away
 * and uncovers the footer, which waits underneath.
 */
export function colorwaysScene(section: HTMLElement) {
  const timeline = sceneTimeline(section);
  const slides = parts(section, 'slide');
  const progress = section.querySelector('[data-progress]');

  slides.forEach((slide, index) => {
    const image = part(slide, 'slide-image');
    const text = part(slide, 'slide-text');
    if (index === 0) return;
    gsap.set([image, text], { opacity: 0 });
    const change = CHANGES[index - 1];
    if (!change) return;
    const [start, end] = change;
    timeline.to(image, { opacity: 1, duration: end - start }, start);
    timeline.to(part(slides[index - 1] ?? slide, 'slide-text'), { opacity: 0, duration: end - start }, start);
    timeline.to(text, { opacity: 1, duration: end - start }, start);
  });

  if (progress) {
    timeline.eventCallback('onUpdate', () => {
      const time = timeline.time();
      setProgress(progress, CHANGES.filter(([start, end]) => time >= (start + end) / 2).length);
    });
  }
}
