import styles from './Progress.module.css';

type ProgressProps = { count: number; active?: number; className?: string };

/** Segmented progress (smart-paper steps, colorways). `data-active` is updated by the scene or carousel. */
export function Progress({ count, active = 0, className }: ProgressProps) {
  return (
    <div className={`${styles.progress} ${className ?? ''}`} data-progress data-active={active} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={styles.segment} data-current={index === active} />
      ))}
    </div>
  );
}
