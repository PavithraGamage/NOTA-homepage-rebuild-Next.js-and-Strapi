import { gsap, type ScrollTrigger } from '../gsap';

/**
 * Keeps a block invisible while it slides in over the previous pinned stage, and shows it the
 * moment its top reaches the top of the screen. By then the previous stage has turned the same
 * colour, so the hand-over is seamless.
 */
export function showWhenPinned(element: HTMLElement) {
  // A 1px scrubbed switch rather than enter/leave callbacks: the state then follows the scroll
  // position on every refresh, including a page restored or deep-linked mid-scroll.
  // Opacity (not visibility) keeps the text available to screen readers; pointer events stay
  // off while it is transparent so it cannot catch clicks or the header's colour check.
  gsap.fromTo(
    element,
    { opacity: 0, pointerEvents: 'none' },
    {
      opacity: 1,
      pointerEvents: 'auto',
      ease: 'none',
      scrollTrigger: { trigger: element, start: 'top top', end: '+=1', scrub: true },
    },
  );
}

/** Scrubbed word-by-word colour reveal (the statements in who-it's-for and inside the box). */
export function revealWords(words: HTMLElement[], from: string, to: string, trigger: ScrollTrigger.Vars) {
  if (!words.length) return;
  // Set every word's start colour up front: a staggered fromTo only renders the first one.
  gsap.set(words, { color: from });
  gsap.to(words, {
    color: to,
    ease: 'none',
    stagger: 1,
    duration: 1,
    scrollTrigger: { ...trigger, scrub: true, invalidateOnRefresh: true },
  });
}
