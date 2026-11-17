'use client';

import { useEffect, useRef } from 'react';
import styles from './Progress.module.css';

type ProgressProps = { count: number; className?: string };

/** Marks segment `index` as current. Scroll scenes call it too, so it works on plain DOM. */
export function setProgress(progress: Element, index: number) {
  progress.querySelectorAll('[data-segment]').forEach((segment, i) => {
    segment.toggleAttribute('data-current', i === index);
  });
}

/**
 * Segmented progress for the smart-paper steps and the colorways. On phones and tablets it
 * follows the swipeable track it sits next to (`[data-carousel-track]` in the same parent);
 * on large screens the track does not scroll and the scroll scene drives it instead.
 */
export function Progress({ count, className }: ProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = ref.current;
    const track = progress?.parentElement?.querySelector<HTMLElement>('[data-carousel-track]');
    if (!progress || !track) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (track.clientWidth === 0) return;
      setProgress(progress, Math.round(track.scrollLeft / track.clientWidth));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
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
