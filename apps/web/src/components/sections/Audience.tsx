import type { AudienceSection } from '@/lib/content/types';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import styles from './Audience.module.css';

export function Audience({ section }: { section: AudienceSection }) {
  return (
    <section
      id={section.anchorId}
      className={styles.audience}
      data-header-theme="dark"
      aria-labelledby={`${section.id}-eyebrow`}
    >
      <p className={`${styles.statement} t-statement`}>{section.statement}</p>

      <div className={styles.intro}>
        <h2 id={`${section.id}-eyebrow`} className={styles.eyebrow}>
          {section.eyebrow}
        </h2>
        <div className={styles.paragraphs}>
          {section.intro.map((paragraph) => (
            <p key={paragraph} className="t-lead">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <ul className={styles.cards}>
        {section.cards.map((card) => (
          <li key={card.title} className={styles.card}>
            <h3 className="t-title">{card.title}</h3>
            <p className={`${styles.cardBody} t-body`}>{card.body}</p>
          </li>
        ))}
      </ul>

      <VideoPlayer video={section.video} className={styles.video} />
    </section>
  );
}
