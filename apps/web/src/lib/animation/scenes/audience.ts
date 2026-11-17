import { gsap } from '../gsap';
import { part, parts, sceneTimeline } from '../timeline';
import { revealWords, showWhenPinned } from './reveal';

/*
 * Measured at 1440×900, in viewport heights of scroll. Offsets are percentages of the element's
 * own size, so they hold at every layout range (cards 430 wide slide in from 480 to the right).
 */
const INTRO_IN = [0.4, 0.62] as const;
const CARDS = { start: 1.28, stagger: 0.111, duration: 0.33, fromXPercent: 111.6 };
/*
 * The video tile, measured on the reference at 1100–2400 wide. Its timeline starts when the
 * camera (the tile's stage) enters at the bottom of the screen, in viewport heights from there:
 * the tile grows while the camera scrolls up and pins, then shrinks and dims while the
 * smart-paper panel slides over it. Offsets are in vh and the start and end values change with
 * the layout range, so they are functions, re-read on every refresh.
 */
const VIDEO = { length: 2.83, grow: [0.02, 1.12] as const, fade: [1.16, 2.77] as const, dim: 0.2 };
const VIDEO_RANGES = [
  { query: '(min-width: 1920px)', fromScale: 0.5, rise: 8.3, toScale: 0.65, endXPercent: -17.4, drop: 8.3 },
  { query: '(min-width: 1440px)', fromScale: 0.5, rise: 9.3, toScale: 0.68, endXPercent: -16, drop: 9.3 },
  { query: 'all', fromScale: 0.7, rise: 17.5, toScale: 0.65, endXPercent: -17.3, drop: 0 },
];
const videoRange = () => VIDEO_RANGES.find(({ query }) => window.matchMedia(query).matches) ?? VIDEO_RANGES[2];
const vh = (value: number) => (value * window.innerHeight) / 100;

/**
 * Who it's for: the statement reveals word by word (grey → white) while it holds at the top,
 * then the intro scrolls on and the cards slide in from the right in a staircase. The video
 * tile follows below the cards on its own stage, grows from the right to near full-bleed while
 * it plays once, then shrinks and dims as the smart-paper panel slides over it.
 */
export function audienceScene(section: HTMLElement) {
  showWhenPinned(section);
  const timeline = sceneTimeline(section);

  revealWords(parts(section, 'word'), '#666666', '#ffffff', {
    trigger: section,
    start: () => `top ${0.11 * window.innerHeight}px`,
    end: () => `+=${0.84 * window.innerHeight}`,
  });

  const intro = part(section, 'intro');
  if (intro) timeline.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: INTRO_IN[1] - INTRO_IN[0] }, INTRO_IN[0]);

  parts(section, 'card').forEach((card, index) => {
    timeline.fromTo(
      card,
      { xPercent: CARDS.fromXPercent },
      { xPercent: 0, duration: CARDS.duration, ease: 'sine.out' },
      CARDS.start + index * CARDS.stagger,
    );
  });

  const videoScene = part(section, 'video-scene');
  const tile = part(section, 'video');
  if (!videoScene || !tile) return;
  const video = gsap.timeline({
    defaults: { ease: 'sine.inOut' },
    scrollTrigger: {
      trigger: videoScene,
      start: 'top bottom',
      end: () => `+=${VIDEO.length * window.innerHeight}`,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  video.set({}, {}, VIDEO.length);
  gsap.set(tile, { transformOrigin: '100% 0%' });
  video.fromTo(
    tile,
    { scale: () => videoRange().fromScale, y: () => -vh(videoRange().rise) },
    { scale: 1, y: 0, duration: VIDEO.grow[1] - VIDEO.grow[0] },
    VIDEO.grow[0],
  );
  video.to(
    tile,
    {
      scale: () => videoRange().toScale,
      opacity: VIDEO.dim,
      xPercent: () => videoRange().endXPercent,
      y: () => vh(videoRange().drop),
      duration: VIDEO.fade[1] - VIDEO.fade[0],
    },
    VIDEO.fade[0],
  );
}
