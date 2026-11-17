'use client';

import styles from './fallback.module.css';

/**
 * Shown when content cannot be loaded and no cached copy exists (e.g. Strapi down on a
 * cold start). The server still responds with a 5xx, so monitors see the failure.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className={styles.page} role="alert">
      <h1 className="t-display">We&rsquo;ll be right back</h1>
      <p className={`${styles.text} t-body`}>This page is temporarily unavailable.</p>
      <button type="button" className={`${styles.action} t-ui`} onClick={reset}>
        Try again
      </button>
    </main>
  );
}
