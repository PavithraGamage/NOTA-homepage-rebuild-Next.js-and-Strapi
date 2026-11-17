import { part, parts, sceneTimeline } from '../timeline';
import { designUnit } from '../units';

/*
 * Positions in viewport heights from the moment the stage pins (1.7vh into the page), measured
 * on the reference at 1440×900 in 100px scroll steps.
 */
const COLUMNS = { start: 0.006, stagger: 0.0806, duration: 0.389, dividersOut: [0.9, 1.3] as const };
const HEADING = { show: 0.8, start: 1.02, end: 1.8 };
const PEN = { start: 1.07, end: 2.07 };
const CARDS = { peekStart: 1.35, peekEnd: 1.52, peek: 77, rise: [1.8, 2.05, 2.35], end: 2.85 };
/** Black bands, top to bottom: each grows from the centre; the bottom one starts first. */
const BANDS = [
  [3.211, 3.833],
  [3.178, 3.8],
  [3.156, 3.667],
  [3.122, 3.544],
] as const;

/**
 * Specs: six white columns rise over the frozen hero, the heading settles from the centre to
 * the top, the pen rises, the cards peek in and then rise one after another. Finally black
 * bands grow out of the pen until the screen is black, handing over to "Who it's for".
 */
export function specsScene(section: HTMLElement) {
  const timeline = sceneTimeline(section);
  const heading = part(section, 'heading');
  const pen = part(section, 'pen');
  const groups = part(section, 'groups');
  const cards = parts(section, 'group');

  parts(section, 'column').forEach((column, index) => {
    timeline.fromTo(
      column,
      { yPercent: 100 },
      { yPercent: 0, duration: COLUMNS.duration, ease: 'power2.inOut' },
      COLUMNS.start + index * COLUMNS.stagger,
    );
  });

  const columns = part(section, 'columns');
  if (columns) {
    const [start, end] = COLUMNS.dividersOut;
    timeline.fromTo(columns, { '--divider': 1 }, { '--divider': 0, duration: end - start }, start);
  }

  if (heading) {
    // Hidden until the middle columns have covered the hero, then centred, then up to its place.
    const toCentre = () => window.innerHeight / 2 - (heading.offsetTop + heading.offsetHeight / 2);
    timeline.fromTo(heading, { autoAlpha: 0, y: toCentre }, { autoAlpha: 1, duration: 0.001 }, HEADING.show);
    timeline.to(heading, { y: 0, duration: HEADING.end - HEADING.start, ease: 'sine.inOut' }, HEADING.start);
  }

  if (pen) {
    timeline.fromTo(
      pen,
      { yPercent: 100 },
      { yPercent: 0, duration: PEN.end - PEN.start, ease: 'sine.out' },
      PEN.start,
    );
  }

  if (groups && cards.length) {
    const below = () => window.innerHeight - groups.offsetTop;
    timeline.fromTo(
      cards,
      { y: below },
      { y: () => below() - CARDS.peek * designUnit(), duration: CARDS.peekEnd - CARDS.peekStart, ease: 'power1.out' },
      CARDS.peekStart,
    );
    cards.forEach((card, index) => {
      const start = CARDS.rise[Math.min(index, CARDS.rise.length - 1)] ?? CARDS.rise[0];
      timeline.to(card, { y: 0, duration: CARDS.end - start, ease: 'sine.inOut' }, start);
    });
  }

  parts(section, 'band').forEach((band, index) => {
    const [start, end] = BANDS[index] ?? BANDS[0];
    timeline.fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: end - start, ease: 'sine.inOut' }, start);
  });
}
