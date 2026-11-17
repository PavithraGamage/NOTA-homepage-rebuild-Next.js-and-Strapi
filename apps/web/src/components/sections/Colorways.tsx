import type { CSSProperties } from 'react';
import type { ColorwaysSection } from '@/lib/content/types';
import { Picture } from '@/components/ui/Picture';
import { Progress } from '@/components/ui/Progress';
import styles from './Colorways.module.css';

/**
 * The intro ("Impossible to | overthink") followed by one slide per colorway of the linked
 * product. Phones and tablets swipe; large screens stack the slides and cross-fade on scroll.
 */
export function Colorways({ section }: { section: ColorwaysSection }) {
  const slides = [
    { key: 'intro', start: section.headingStart, end: section.headingEnd, color: '#FFFFFF', image: section.introImage },
    ...section.colorways.map((c) => ({
      key: c.name,
      start: c.name,
      end: c.tagline,
      color: c.textColor,
      image: c.image,
    })),
  ];

  return (
    <section
      id={section.anchorId}
      className={styles.colorways}
      data-header-theme="dark"
      aria-label={`${section.headingStart} ${section.headingEnd}`}
    >
      <ol className={styles.track} data-carousel-track>
        {slides.map((slide, index) => (
          <li
            key={slide.key}
            className={styles.slide}
            data-slide={index}
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${slides.length}`}
            style={{ '--text': slide.color } as CSSProperties}
          >
            <Picture image={slide.image} sizes="100vw" className={styles.image} />
            <p className={`${styles.text} t-colorway`} data-intro={index === 0}>
              <span className={styles.start}>{slide.start}</span> <span className={styles.end}>{slide.end}</span>
            </p>
          </li>
        ))}
      </ol>
      <Progress count={slides.length} className={styles.progress} />
    </section>
  );
}
