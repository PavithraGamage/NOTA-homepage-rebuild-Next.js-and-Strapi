'use client';

import { useEffect, useRef } from 'react';
import type { VideoAsset } from '@/lib/content/types';

type VideoPlayerProps = {
  video: VideoAsset;
  className?: string;
  /** Loop while visible (detail tiles). Otherwise it plays once when it scrolls into view. */
  loop?: boolean;
};

/**
 * Muted inline video that downloads nothing until it is within a screen of the viewport, then
 * plays when mostly visible. Visitors who prefer reduced motion get the first frame, no
 * autoplay. (The source files keep their index at the end, so even "metadata" would fetch
 * most of the file on page load; deferring keeps them out of the first paint.)
 */
export function VideoPlayer({ video, className, loop = false }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        element.preload = 'auto';
        element.load();
      },
      { rootMargin: '100% 0px' },
    );
    near.observe(element);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => near.disconnect();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void element.play().catch(() => {
            // Autoplay can be refused (e.g. low-power mode); the poster/first frame stays visible.
          });
        } else if (loop) {
          element.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      near.disconnect();
      observer.disconnect();
    };
  }, [loop]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      playsInline
      loop={loop}
      preload="none"
      poster={video.poster?.url}
      aria-label={video.description}
      aria-hidden={video.description ? undefined : true}
    >
      {/* #t=0.001 makes Safari paint the first frame as a poster when none is set. */}
      <source src={`${video.url}#t=0.001`} type={video.mime} />
    </video>
  );
}
