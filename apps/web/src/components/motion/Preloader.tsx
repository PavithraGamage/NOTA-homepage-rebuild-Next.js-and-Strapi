'use client';

import { useEffect, useRef } from 'react';
import { INTRO_DONE_EVENT, onLoadingProgress, trackLoading } from '@/lib/animation/loading';
import { CINEMATIC } from '@/lib/animation/media';
import { scrambleIn } from '@/lib/animation/scramble';
import styles from './Preloader.module.css';

/** Measured on the reference: 0→100% in about 1.2s (ease-in-out), then a 0.8s fade. */
const COUNT_MS = 1200;
const HOLD_MS = 300;
const TIMEOUT_MS = 6000;
/** The heading starts its reveal once the overlay is mostly gone, so the flicker is seen. */
const REVEAL_DELAY_MS = 250;
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Large-screen intro: a counter over the stage gradient that follows real loading progress
 * (fonts and the hero sequence) but never runs faster than the reference's 1.2s count, and
 * gives up after 6s so it can never hang. Then it fades, the header fades in and scrambles its
 * labels once, and the hero heading reveals letter by letter through random letters, as on the
 * reference. CSS hides it on other screens and also fades it out after 6s if this script never
 * runs; the heading then simply stays as it is.
 */
export function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    if (!overlay || !counter) return;
    if (!window.matchMedia(CINEMATIC).matches) {
      overlay.dataset.state = 'done';
      return;
    }

    const root = document.documentElement;
    root.classList.add('scroll-locked');
    const reportFonts = trackLoading('fonts');
    void document.fonts.ready.then(() => reportFonts(1));
    // The hero scene loads on demand and reports into this task; register it now so the
    // counter can't reach 100% before the sequence download has even started.
    if (document.querySelector('[data-anim="sequence"]')) trackLoading('hero-sequence', 3);

    let loaded = 0;
    const unsubscribe = onLoadingProgress((progress) => (loaded = progress));
    let finished = false;
    let stopReveal: (() => void) | undefined;

    const finish = () => {
      finished = true;
      unsubscribe();
      overlay.dataset.state = 'done';
      root.classList.remove('scroll-locked');
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      const heading = document.querySelector<HTMLElement>('[data-anim="hero-heading"]');
      if (heading) stopReveal = scrambleIn(heading, Array.from(heading.querySelectorAll('.line')), REVEAL_DELAY_MS);
      // Same chunk the scenes use; already loaded by the time the intro ends.
      void import('@/lib/animation/gsap').then(({ gsap, ScrollTrigger }) => {
        gsap.fromTo('header', { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 0.1, ease: 'power1.out' });
        ScrollTrigger.refresh();
      });
    };

    const start = performance.now();
    let heldSince = 0;
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const shown = elapsed >= TIMEOUT_MS ? 1 : Math.min(easeInOut(Math.min(1, elapsed / COUNT_MS)), loaded);
      counter.textContent = `${Math.round(shown * 100)}%`;
      if (shown >= 1) heldSince ||= now;
      if (heldSince && now - heldSince >= HOLD_MS) finish();
      else frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      stopReveal?.();
      if (!finished) root.classList.remove('scroll-locked');
    };
  }, []);

  return (
    <div ref={overlayRef} className={styles.preloader} aria-hidden="true">
      <span ref={counterRef} className={`${styles.counter} t-display`}>
        0%
      </span>
    </div>
  );
}
