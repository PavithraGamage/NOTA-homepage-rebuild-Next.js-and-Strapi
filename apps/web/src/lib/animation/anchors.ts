import type { SceneName } from './scenes';

/**
 * Where an in-page link lands inside each scene, in viewport heights from the section top
 * (reference at 1440×900: Specifications 2.65, Who it's for 5.92, About 9.92, Inside the box 16.2).
 * Kept apart from the scenes so reading it never pulls in GSAP.
 */
export const ANCHOR_OFFSETS: Partial<Record<SceneName, number>> = {
  specs: 0.95,
  audience: 0.37,
  'inside-box': 0.64,
};
