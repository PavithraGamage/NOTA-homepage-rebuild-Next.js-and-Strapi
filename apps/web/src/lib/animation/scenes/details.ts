import { gsap } from '../gsap';
import { parts } from '../timeline';

/**
 * Details bento: as each tile scrolls in, its picture fades in quickly and settles from 1.3×
 * to full size (measured: fade over the first ~100px, settle until the tile is near the top).
 * The video tile only fades.
 */
export function detailsScene(section: HTMLElement) {
  parts(section, 'tile-media').forEach((media) => {
    const tile = media.parentElement ?? media;
    gsap.fromTo(
      media,
      { autoAlpha: 0 },
      { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: tile, start: 'top 85%', end: 'top 72%', scrub: true } },
    );
    if (media.dataset.kind !== 'video') {
      gsap.fromTo(
        media,
        { scale: 1.3 },
        {
          scale: 1,
          ease: 'sine.inOut',
          scrollTrigger: { trigger: tile, start: 'top 85%', end: 'top 15%', scrub: true },
        },
      );
    }
  });
}
