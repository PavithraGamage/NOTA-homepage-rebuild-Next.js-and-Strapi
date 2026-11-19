import type { SmartPaperSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import { Progress } from '@/components/ui/Progress';
import styles from './SmartPaper.module.css';

type StepContent = SmartPaperSection['steps'][number];

const COLUMNS = 6;

/**
 * Intro panel, then the story steps. Phones and tablets swipe through the steps (scroll-snap);
 * large screens stack everything in one pinned stage: the intro splits into columns that drop
 * away, the steps change with scroll, and a white circle grows into "Inside the box".
 */
export function SmartPaper({ section }: { section: SmartPaperSection }) {
  const headingId = `${section.id}-heading`;
  const { steps } = section;
  const count = steps.length;
  // Phones and tablets loop: a copy of the last slide before the first and of the first after the
  // last (see Progress, which makes the jump).
  const [first, last] = [steps[0], steps.at(-1)];
  const loops = count > 1 && first && last;
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
            {loops && <Step step={last} index={count - 1} count={count} clone />}
            {steps.map((step, index) => (
              <Step key={step.subheading} step={step} index={index} count={count} />
            ))}
            {loops && <Step step={first} index={0} count={count} clone />}
          </ol>
          <Progress count={count} className={styles.progress} />
        </div>

        <span className={styles.circle} data-anim="circle" data-header-theme="light" aria-hidden="true" />
      </div>
    </Scene>
  );
}

/**
 * One story step. A copy (the loop's ends on phones) is hidden from assistive technology and
 * from the scroll scene, which only animates the real steps.
 */
function Step({
  step,
  index,
  count,
  clone = false,
}: {
  step: StepContent;
  index: number;
  count: number;
  clone?: boolean;
}) {
  const anim = (name: string) => (clone ? undefined : name);
  return (
    <li
      className={clone ? `${styles.step} ${styles.clone}` : styles.step}
      data-step={clone ? undefined : index}
      data-anim={anim('step')}
      data-clone={clone ? '' : undefined}
      style={clone ? undefined : { zIndex: count - index }}
      aria-hidden={clone || undefined}
      inert={clone || undefined}
      aria-roledescription={clone ? undefined : 'slide'}
      aria-label={clone ? undefined : `${index + 1} / ${count}`}
    >
      <div className={styles.image} data-anim={anim('step-image')}>
        <Picture image={step.image} sizes="100vw" />
      </div>
      <div className={styles.copy} data-anim={anim('step-copy')}>
        <h3 className={`${styles.stepHeading} t-statement`}>
          <Lines lines={step.heading} breaks="first" />
        </h3>
        <div className={styles.cards}>
          <p className={`${styles.card} t-title`}>{step.subheading}</p>
          <p className={`${styles.card} ${styles.cardBody} t-small`}>{step.body}</p>
        </div>
      </div>
    </li>
  );
}
