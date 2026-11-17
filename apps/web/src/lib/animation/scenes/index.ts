import { audienceScene } from './audience';
import { colorwaysScene } from './colorways';
import { detailsScene } from './details';
import { heroScene } from './hero';
import { insideBoxScene } from './inside-box';
import { smartPaperScene } from './smart-paper';
import { specsScene } from './specs';

/**
 * One scroll scene per section type. Each receives its section element and may return a
 * cleanup function; tweens and ScrollTriggers are cleaned up by gsap.matchMedia.
 */
export const SCENES = {
  hero: heroScene,
  specs: specsScene,
  audience: audienceScene,
  'smart-paper': smartPaperScene,
  'inside-box': insideBoxScene,
  details: detailsScene,
  colorways: colorwaysScene,
} satisfies Record<string, (section: HTMLElement) => void | (() => void)>;

export type SceneName = keyof typeof SCENES;
