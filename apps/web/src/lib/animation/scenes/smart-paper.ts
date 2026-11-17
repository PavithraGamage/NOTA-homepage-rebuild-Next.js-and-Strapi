import { setProgress } from '@/components/ui/Progress';
import { gsap } from '../gsap';
import { part, parts, sceneTimeline } from '../timeline';

/* Measured at 1440×900, in viewport heights from the moment the panel reaches the top. */
const INTRO = { headingOut: [0.17, 0.39], dividersIn: [0.22, 0.44] } as const;
const COLUMNS = { start: 0.611, stagger: 0.053, duration: 0.39 };
/** Step changes: the outgoing image shrinks and fades while the next one zooms in. */
const CHANGES = [
  [1.89, 2.11],
  [2.72, 2.89],
  [3.56, 3.78],
] as const;
const OUTRO = { fade: [4.67, 5.0], progressOut: [4.44, 4.78], dot: 4.94, grow: [5.0, 5.56] } as const;
/**
 * The circle's measured growth every 100px of scroll, as fractions of the size that just covers
 * the screen. The scene ends when it covers; "Inside the box" takes over from there.
 */
const CIRCLE_GROWTH = [0.014, 0.092, 0.229, 0.433, 0.701, 1];

/**
 * Smart paper: the white intro splits into six columns that drop away to reveal the first
 * step; each step change swaps the image (shrink-and-fade out, zoom in) and the copy; the
 * progress bar follows. At the end the last step fades to black and a white dot grows into a
 * circle that fills the screen, which is where "Inside the box" takes over.
 */
export function smartPaperScene(section: HTMLElement) {
  const timeline = sceneTimeline(section);
  const steps = parts(section, 'step');
  const progress = section.querySelector<HTMLElement>('[data-progress]');

  const heading = part(section, 'intro-heading');
  if (heading)
    timeline.to(heading, { opacity: 0, duration: INTRO.headingOut[1] - INTRO.headingOut[0] }, INTRO.headingOut[0]);
  const columns = part(section, 'columns');
  if (columns) {
    timeline.fromTo(
      columns,
      { '--divider': 0 },
      { '--divider': 1, duration: INTRO.dividersIn[1] - INTRO.dividersIn[0] },
      INTRO.dividersIn[0],
    );
  }
  parts(section, 'column').forEach((column, index) => {
    timeline.to(
      column,
      { yPercent: 100, duration: COLUMNS.duration, ease: 'power2.inOut' },
      COLUMNS.start + index * COLUMNS.stagger,
    );
  });

  steps.forEach((step, index) => {
    const image = part(step, 'step-image');
    const copy = part(step, 'step-copy');
    if (index > 0) {
      gsap.set(copy, { opacity: 0 });
      gsap.set(image, { scale: 1.4 });
    }
    const change = CHANGES[index - 1];
    if (change && image) {
      const previous = steps[index - 1];
      const [start, end] = change;
      timeline.to(
        part(previous, 'step-image'),
        { scale: 0.6, opacity: 0, duration: end - start, ease: 'power2.out' },
        start,
      );
      timeline.to(image, { scale: 1, duration: end - start, ease: 'power2.out' }, start);
      timeline.set(part(previous, 'step-copy'), { opacity: 0 }, start + 0.05);
      timeline.set(copy, { opacity: 1 }, start + 0.05);
    }
  });

  const last = steps.at(-1);
  if (last) timeline.to(last, { opacity: 0, duration: OUTRO.fade[1] - OUTRO.fade[0] }, OUTRO.fade[0]);
  if (progress) {
    timeline.to(progress, { opacity: 0, duration: OUTRO.progressOut[1] - OUTRO.progressOut[0] }, OUTRO.progressOut[0]);
    timeline.eventCallback('onUpdate', () => {
      const time = timeline.time();
      setProgress(progress, CHANGES.filter(([start]) => time >= start + 0.05).length);
    });
  }

  const circle = part(section, 'circle');
  if (circle) {
    // Hidden until its moment, so it never shows as a dot over the steps.
    timeline.fromTo(circle, { autoAlpha: 0, scale: 0.01 }, { autoAlpha: 1, duration: 0.001 }, OUTRO.dot);
    const finalScale = Math.hypot(window.innerWidth, window.innerHeight) / circle.offsetWidth;
    timeline.to(
      circle,
      {
        keyframes: { scale: CIRCLE_GROWTH.map((f) => Math.max(0.01, f * finalScale)) },
        duration: OUTRO.grow[1] - OUTRO.grow[0],
        ease: 'none',
      },
      OUTRO.grow[0],
    );
  }
}
