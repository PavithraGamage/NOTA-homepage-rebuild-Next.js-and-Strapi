import type { HeroSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import styles from './Hero.module.css';

/**
 * Opening screen. Large screens show the pen sequence's first frame full-bleed, and in the
 * cinematic mode a canvas scrubs the whole sequence over it; tablets and phones show the
 * upright pen over the stage gradient.
 */
export function Hero({ section }: { section: HeroSection }) {
  return (
    <Scene
      scene="hero"
      id={section.anchorId}
      className={styles.hero}
      data-header-theme="dark"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className={styles.stage}>
        <Picture image={section.image} sizes="(max-width: 991px) 60vw, 100vw" priority className={styles.media} />
        {section.sequenceUrl && (
          <canvas className={styles.sequence} data-anim="sequence" data-src={section.sequenceUrl} aria-hidden="true" />
        )}
        <h1 id={`${section.id}-heading`} className={`${styles.heading} t-display`} data-anim="hero-heading">
          <Lines lines={section.heading} breaks="always" />
        </h1>
      </div>
    </Scene>
  );
}
