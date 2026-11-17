import { Fragment } from 'react';
import type { AudienceSection } from '@/lib/content/types';
import { Scene } from '@/components/motion/Scene';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import styles from './Audience.module.css';

export function Audience({ section }: { section: AudienceSection }) {
  return (
    <Scene
      scene="audience"
      id={section.anchorId}
      className={styles.audience}
      data-header-theme="dark"
      aria-labelledby={`${section.id}-eyebrow`}
    >
      {/* On large screens the lead holds at the top while the statement reveals word by word. */}
      <div className={styles.leadTrack}>
        <div className={styles.lead}>
          <p className={`${styles.statement} t-statement`}>
            {section.statement.split(' ').map((word, index) => (
              <Fragment key={index}>
                {index > 0 && ' '}
                <span data-anim="word">{word}</span>
              </Fragment>
            ))}
          </p>

          <div className={styles.intro} data-anim="intro">
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
        </div>
      </div>

      <ul className={styles.cards}>
        {section.cards.map((card) => (
          <li key={card.title} className={styles.card} data-anim="card">
            <h3 className="t-title">{card.title}</h3>
            <p className={`${styles.cardBody} t-body`}>{card.body}</p>
          </li>
        ))}
      </ul>

      <div className={styles.videoScene} data-anim="video-scene">
        <div className={styles.videoStage}>
          <div className={styles.videoTile} data-anim="video">
            <VideoPlayer video={section.video} className={styles.video} />
          </div>
        </div>
      </div>
    </Scene>
  );
}
