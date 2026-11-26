import styles from './PortfolioNotice.module.css';

/**
 * Says plainly that this is an unofficial rebuild, so no visitor mistakes it for NŌTA's own site.
 * Hard-coded like `noindex`: it must not depend on, or be removable from, the CMS.
 */
export function PortfolioNotice() {
  return (
    <aside className={styles.notice} aria-label="About this site" data-header-theme="dark">
      <p>
        Unofficial portfolio rebuild of{' '}
        <a href="https://nota.uprock.pro/" rel="noopener noreferrer" target="_blank">
          nota.uprock.pro
        </a>
        , not affiliated with NŌTA or UPROCK Studio. The design, copy and media belong to their creators.
      </p>
    </aside>
  );
}
