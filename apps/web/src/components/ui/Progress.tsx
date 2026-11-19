'use client';

import { useEffect, useRef } from 'react';
import { loopedIndex, loopJump } from './carousel';
import styles from './Progress.module.css';

type ProgressProps = { count: number; className?: string };

/**
 * Marks segment `index` as current. Scroll scenes call it on every frame, so it works on plain
 * DOM and only touches the DOM when the step actually changes.
 */
export function setProgress(progress: HTMLElement, index: number) {
  if (progress.dataset.index === String(index)) return;
  progress.dataset.index = String(index);
  progress.querySelectorAll('[data-segment]').forEach((segment, i) => {
    segment.toggleAttribute('data-current', i === index);
  });
}

/** Quiet time after the last scroll event that counts as "come to rest" (where `scrollend` is missing). */
const SETTLE_MS = 120;

/**
 * Segmented progress for the smart-paper steps and the colorways. On phones and tablets it
 * follows the swipeable track it sits next to (`[data-carousel-track]` in the same parent);
 * on large screens the track does not scroll and the scroll scene drives it instead.
 *
 * If the track has copies at both ends (`[data-clone]`), it also loops: the copies are shown
 * once this runs, the track starts on the first real slide, and whenever it comes to rest on a
 * copy it jumps to the real slide the copy shows. They look the same, so the swipe just wraps.
 */
export function Progress({ count, className }: ProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = ref.current;
    const track = progress?.parentElement?.querySelector<HTMLElement>('[data-carousel-track]');
    if (!progress || !track) return;
    const canLoop = track.querySelector(':scope > [data-clone]') !== null;
    const slides = track.querySelectorAll(':scope > :not([data-clone])').length;
    const looping = () => track.hasAttribute('data-looping');
    const position = () => (track.clientWidth ? track.scrollLeft / track.clientWidth : 0);
    const jumpTo = (index: number) => track.scrollTo({ left: index * track.clientWidth, behavior: 'instant' });

    // Keyboard users can reach and scroll the track (arrow keys) wherever it actually scrolls;
    // looping applies only there too.
    const syncLayout = () => {
      const scrollable = track.scrollWidth > track.clientWidth + 1;
      if (scrollable) track.tabIndex = 0;
      else track.removeAttribute('tabindex');
      if (canLoop && scrollable && !looping()) {
        track.setAttribute('data-looping', '');
        jumpTo(1);
      } else if (!scrollable && looping()) {
        track.removeAttribute('data-looping');
      }
    };
    let frame = 0;
    let timer = 0;
    const update = () => {
      frame = 0;
      if (track.clientWidth === 0) return;
      const index = Math.round(position());
      setProgress(progress, looping() ? loopedIndex(index, slides) : index);
    };
    const settle = () => {
      window.clearTimeout(timer);
      if (!looping()) return;
      const target = loopJump(position(), slides);
      if (target !== null) jumpTo(target);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    syncLayout();
    const resize = new ResizeObserver(syncLayout);
    resize.observe(track);
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scrollend', settle);
    return () => {
      resize.disconnect();
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('scrollend', settle);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.progress} ${className ?? ''}`} data-progress aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={styles.segment} data-segment data-current={index === 0 ? '' : undefined} />
      ))}
    </div>
  );
}
