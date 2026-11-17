import type { HeroSection } from '@/lib/content/types';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import styles from './Hero.module.css';

/**
 * Opening screen. Large screens show the pen sequence's first frame full-bleed (the scroll
 * animation replaces it later); tablets and phones show the upright pen over the stage gradient.
 */
export function Hero({ section }: { section: HeroSection }) {
  return (
    <section
      id={section.anchorId}
      className={styles.hero}
      data-header-theme="dark"
      aria-labelledby={`${section.id}-heading`}
    >
      <Picture image={section.image} sizes="(max-width: 991px) 60vw, 100vw" priority className={styles.media} />
      <h1 id={`${section.id}-heading`} className={`${styles.heading} t-display`}>
        <Lines lines={section.heading} breaks="always" />
      </h1>
    </section>
  );
}
