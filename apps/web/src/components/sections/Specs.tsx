import type { SpecsSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { Picture } from '@/components/ui/Picture';
import styles from './Specs.module.css';

const COLUMNS = 6;
const BANDS = 4;

export function Specs({ section }: { section: SpecsSection }) {
  return (
    <Scene
      scene="specs"
      id={section.anchorId}
      className={styles.specs}
      data-header-theme="light"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className={styles.stage}>
        {/* Scroll-scene decoration (large screens only): columns that wipe in, bands that wipe out. */}
        <div className={styles.columns} data-anim="columns" aria-hidden="true">
          {Array.from({ length: COLUMNS }, (_, index) => (
            <span key={index} className={styles.column} data-anim="column" />
          ))}
        </div>

        <h2 id={`${section.id}-heading`} className={`${styles.heading} t-display`} data-anim="heading">
          <span className={styles.muted}>{section.headingMuted}</span>
          <span className={styles.strong}>{section.heading}</span>
        </h2>

        <div className={styles.pen} data-anim="pen">
          <Picture image={section.penImage} sizes="(max-width: 767px) 94vw, (max-width: 991px) 29vw, 13vw" />
        </div>

        <div className={styles.groups} data-anim="groups">
          {section.groups.map((group) => (
            <section key={group.title} className={styles.group} aria-label={group.title} data-anim="group">
              <h3 className={`${styles.groupTitle} t-title`}>{group.title}</h3>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item} className={`${styles.item} t-small`}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className={styles.bands} aria-hidden="true">
          {Array.from({ length: BANDS }, (_, index) => (
            <span key={index} className={styles.band} data-anim="band" />
          ))}
        </div>
      </div>
    </Scene>
  );
}
