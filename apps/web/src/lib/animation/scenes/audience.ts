import { gsap } from '../gsap';
import { part, parts, sceneTimeline } from '../timeline';
import { revealWords, showWhenPinned } from './reveal';

/*
 * Measured at 1440×900, in viewport heights of scroll. Offsets are percentages of the element's
 * own size, so they hold at every layout range (cards 430 wide slide in from 480 to the right;
 * the 1360×660 video tile rises 405 while it grows).
 */
const INTRO_IN = [0.4, 0.62] as const;
const CARDS = { start: 1.28, stagger: 0.111, duration: 0.33, fromXPercent: 111.6 };
const VIDEO = {
  growEnd: 1,
  /** The tile's vertical path while it grows (yPercent at 9 even steps). */
  rise: [61.4, 49.4, 40.2, 33.2, 28.6, 25, 19.2, 10.8, 0],
  fade: [1.11, 2.67] as const,
  fromScale: 0.51,
  toScale: 0.68,
  dim: 0.2,
  /** Ends centred and slightly raised: half the lost size, plus 21px at 1440. */
  endXPercent: -16,
  endYPercent: -19.2,
};

/**
 * Who it's for: the statement reveals word by word (grey → white) while it holds at the top,
 * then the intro scrolls on and the cards slide in from the right in a staircase. The video
 * tile pins on its own stage, grows from the bottom-right corner to near full-bleed while it
 * plays once, then shrinks and dims as the smart-paper panel slides over it.
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
  if (intro)
    timeline.fromTo(intro, { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO_IN[1] - INTRO_IN[0] }, INTRO_IN[0]);

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
  const video = sceneTimeline(videoScene);
  gsap.set(tile, { transformOrigin: '100% 100%', yPercent: VIDEO.rise[0] });
  video.fromTo(tile, { scale: VIDEO.fromScale }, { scale: 1, duration: VIDEO.growEnd, ease: 'sine.inOut' }, 0);
  video.to(tile, { keyframes: { yPercent: VIDEO.rise }, duration: VIDEO.growEnd, ease: 'none' }, 0);
  video.to(
    tile,
    {
      scale: VIDEO.toScale,
      autoAlpha: VIDEO.dim,
      xPercent: VIDEO.endXPercent,
      yPercent: VIDEO.endYPercent,
      duration: VIDEO.fade[1] - VIDEO.fade[0],
      ease: 'sine.inOut',
    },
    VIDEO.fade[0],
  );
}
