import Link from 'next/link';
import { connection } from 'next/server';
import styles from './fallback.module.css';

/**
 * Any URL other than the homepage (this site is a single page). Rendered per request, like the
 * homepage, so its scripts carry the CSP nonce (a prerendered page has none and would be blocked).
 */
export default async function NotFound() {
  await connection();
  return (
    <main className={styles.page}>
      <h1 className="t-display">Page not found</h1>
      <p className={`${styles.text} t-body`}>This site is a single page.</p>
      <Link href="/" className={`${styles.action} t-ui`}>
        Back to the homepage
      </Link>
    </main>
  );
}
