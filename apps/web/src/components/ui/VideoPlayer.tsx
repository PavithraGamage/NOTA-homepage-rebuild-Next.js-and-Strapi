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
 * Muted inline video that only downloads and plays once it is near the viewport, and never
 * autoplays for visitors who prefer reduced motion (they see the poster or first frame).
 */
export function VideoPlayer({ video, className, loop = false }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
    return () => observer.disconnect();
  }, [loop]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      playsInline
      loop={loop}
      preload="metadata"
      poster={video.poster?.url}
      aria-label={video.description}
      aria-hidden={video.description ? undefined : true}
    >
      {/* #t=0.001 makes Safari paint the first frame as a poster when none is set. */}
      <source src={`${video.url}#t=0.001`} type={video.mime} />
    </video>
  );
}
