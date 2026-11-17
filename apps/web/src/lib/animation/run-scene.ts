import { gsap } from './gsap';
import { CINEMATIC } from './media';
import { SCENES, type SceneName } from './scenes';

/**
 * Sets a section's scene up while cinematic mode applies and tears it down (every tween and
 * ScrollTrigger) when it stops or when the returned cleanup runs. Loaded on demand, so
 * phones and reduced-motion visitors never download GSAP or the scenes.
 */
export function runScene(name: SceneName, section: HTMLElement): () => void {
  const media = gsap.matchMedia();
  media.add(CINEMATIC, () => SCENES[name](section));
  return () => media.revert();
}
