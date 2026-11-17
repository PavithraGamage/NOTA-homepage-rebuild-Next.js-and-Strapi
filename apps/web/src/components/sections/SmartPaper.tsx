import type { SmartPaperSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import { Progress } from '@/components/ui/Progress';
import styles from './SmartPaper.module.css';

const COLUMNS = 6;

/**
 * Intro panel, then the story steps. Phones and tablets swipe through the steps (scroll-snap);
 * large screens stack everything in one pinned stage: the intro splits into columns that drop
 * away, the steps change with scroll, and a white circle grows into "Inside the box".
 */
export function SmartPaper({ section }: { section: SmartPaperSection }) {
  const headingId = `${section.id}-heading`;
  const count = section.steps.length;
  return (
    <Scene scene="smart-paper" id={section.anchorId} className={styles.smartPaper} aria-labelledby={headingId}>
      <div className={styles.stage}>
        <div className={styles.intro} data-header-theme="light">
          <div className={styles.columns} data-anim="columns" aria-hidden="true">
            {Array.from({ length: COLUMNS }, (_, index) => (
              <span key={index} className={styles.column} data-anim="column" />
            ))}
          </div>
          <h2 id={headingId} className={`${styles.heading} t-display-xl`} data-anim="intro-heading">
            <span className={styles.muted}>{section.headingMuted}</span>
            <span className={styles.strong}>{section.heading}</span>
          </h2>
        </div>

        <div className={styles.steps} data-header-theme="dark">
          <ol className={styles.track} data-carousel-track aria-label={`${section.headingMuted} ${section.heading}`}>
            {section.steps.map((step, index) => (
              <li
                key={step.subheading}
                className={styles.step}
                data-step={index}
                data-anim="step"
                style={{ zIndex: count - index }}
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}`}
              >
                <div className={styles.image} data-anim="step-image">
                  <Picture image={step.image} sizes="100vw" />
                </div>
                <div className={styles.copy} data-anim="step-copy">
                  <h3 className={`${styles.stepHeading} t-statement`}>
                    <Lines lines={step.heading} breaks="always" />
                  </h3>
                  <div className={styles.cards}>
                    <p className={`${styles.card} t-title`}>{step.subheading}</p>
                    <p className={`${styles.card} ${styles.cardBody} t-small`}>{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Progress count={count} className={styles.progress} />
        </div>

        <span className={styles.circle} data-anim="circle" aria-hidden="true" />
      </div>
    </Scene>
  );
}
