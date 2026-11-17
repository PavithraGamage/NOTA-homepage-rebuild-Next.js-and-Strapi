import type { SmartPaperSection } from '@/lib/content/types';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import { Progress } from '@/components/ui/Progress';
import styles from './SmartPaper.module.css';

/**
 * Intro panel, then the story steps. Phones and tablets swipe through the steps (scroll-snap);
 * large screens stack them in one stage, where the scroll scene reveals them in turn.
 */
export function SmartPaper({ section }: { section: SmartPaperSection }) {
  const headingId = `${section.id}-heading`;
  return (
    <section id={section.anchorId} className={styles.smartPaper} aria-labelledby={headingId}>
      <div className={styles.intro} data-header-theme="light">
        <h2 id={headingId} className={`${styles.heading} t-display-xl`}>
          <span className={styles.muted}>{section.headingMuted}</span>
          <span className={styles.strong}>{section.heading}</span>
        </h2>
      </div>

      <div className={styles.stage} data-header-theme="dark">
        <ol className={styles.track} data-carousel-track aria-label={`${section.headingMuted} ${section.heading}`}>
          {section.steps.map((step, index) => (
            <li
              key={step.subheading}
              className={styles.step}
              data-step={index}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${section.steps.length}`}
            >
              <Picture image={step.image} sizes="100vw" className={styles.image} />
              <h3 className={`${styles.stepHeading} t-statement`}>
                <Lines lines={step.heading} breaks="always" />
              </h3>
              <div className={styles.cards}>
                <p className={`${styles.card} t-title`}>{step.subheading}</p>
                <p className={`${styles.card} ${styles.cardBody} t-small`}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Progress count={section.steps.length} className={styles.progress} />
      </div>
    </section>
  );
}
