import type { SpecsSection } from '@/lib/content/types';
import { Picture } from '@/components/ui/Picture';
import styles from './Specs.module.css';

export function Specs({ section }: { section: SpecsSection }) {
  return (
    <section
      id={section.anchorId}
      className={styles.specs}
      data-header-theme="light"
      aria-labelledby={`${section.id}-heading`}
    >
      <h2 id={`${section.id}-heading`} className={`${styles.heading} t-display`}>
        <span className={styles.muted}>{section.headingMuted}</span>
        <span className={styles.strong}>{section.heading}</span>
      </h2>

      <Picture
        image={section.penImage}
        sizes="(max-width: 767px) 94vw, (max-width: 991px) 29vw, 13vw"
        className={styles.pen}
      />

      <div className={styles.groups}>
        {section.groups.map((group) => (
          <section key={group.title} className={styles.group} aria-label={group.title}>
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
    </section>
  );
}
