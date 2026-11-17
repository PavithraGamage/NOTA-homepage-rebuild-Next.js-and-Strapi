import type { DetailsSection } from '@/lib/content/types';
import { Picture } from '@/components/ui/Picture';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import styles from './Details.module.css';

/** Six tiles in fixed slots; the grid position comes from the order set in the CMS. */
export function Details({ section }: { section: DetailsSection }) {
  return (
    <section id={section.anchorId} className={styles.details} data-header-theme="dark" aria-label="Product details">
      <ul className={styles.grid}>
        {section.tiles.map((tile, index) => (
          <li key={index} className={styles.tile} data-slot={index + 1}>
            {tile.video ? (
              <VideoPlayer
                video={{ ...tile.video, poster: tile.video.poster ?? tile.image?.image }}
                loop
                className={styles.media}
              />
            ) : (
              tile.image && (
                <Picture image={tile.image} sizes="(max-width: 991px) 96vw, 70vw" className={styles.picture} />
              )
            )}
            {tile.label && <span className={`${styles.label} t-pill`}>{tile.label}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
