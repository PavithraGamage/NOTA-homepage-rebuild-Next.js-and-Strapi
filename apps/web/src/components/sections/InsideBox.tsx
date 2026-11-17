import { Fragment } from 'react';
import type { InsideBoxSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { Lines } from '@/components/ui/Lines';
import { Picture } from '@/components/ui/Picture';
import styles from './InsideBox.module.css';

export function InsideBox({ section }: { section: InsideBoxSection }) {
  const headingId = `${section.id}-heading`;
  return (
    <Scene
      scene="inside-box"
      id={section.anchorId}
      className={styles.insideBox}
      data-header-theme="light"
      aria-labelledby={headingId}
    >
      <div className={styles.intro} data-anim="intro">
        <div className={styles.introStage}>
          <h2 id={headingId} className={`${styles.heading} t-display-xl`} data-anim="heading">
            <span className={styles.muted}>{section.headingMuted}</span>
            <span className={styles.strong}>{section.heading}</span>
          </h2>
        </div>
      </div>

      <figure className={styles.card} data-anim="blinds">
        <Picture image={section.kit.image} sizes="(max-width: 991px) 96vw, 94vw" className={styles.cardImage} />
        <figcaption className={styles.caption} data-anim="caption">
          <span className={`${styles.captionTitle} t-title`}>{section.kit.title}</span>
          <span className={`${styles.captionBody} t-body`}>{section.kit.body}</span>
        </figcaption>
      </figure>

      <p className={`${styles.statement} t-statement`} data-anim="statement">
        {section.statement.split(' ').map((word, index) => (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span data-anim="word">{word}</span>
          </Fragment>
        ))}
      </p>

      <ul className={styles.items}>
        {section.items.map((item) => (
          <li key={item.name} className={`${styles.card} ${styles.item}`} data-anim="blinds">
            <Picture image={item.image} sizes="(max-width: 991px) 96vw, 47vw" className={styles.cardImage} />
            <div className={styles.caption} data-anim="caption">
              <h3 className={`${styles.captionTitle} t-title`}>{item.name}</h3>
              <p className={`${styles.captionBody} t-body`}>
                <Lines lines={item.description} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Scene>
  );
}
