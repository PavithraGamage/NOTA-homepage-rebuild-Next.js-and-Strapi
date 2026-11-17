import type { SiteChrome } from '@/lib/content/types';
import { Lines } from '@/components/ui/Lines';
import { FooterCredits } from './FooterCredits';
import styles from './Footer.module.css';

type FooterProps = { chrome: SiteChrome };

export function Footer({ chrome }: FooterProps) {
  const { footer } = chrome;
  return (
    <footer className={styles.footer} data-header-theme="dark">
      <p className={`${styles.tagline} t-tagline`}>
        <Lines lines={footer.tagline} />
      </p>

      <nav className={styles.nav} aria-labelledby="footer-nav-heading">
        <p id="footer-nav-heading" className={`${styles.label} t-label`}>
          {footer.navHeading}
        </p>
        <ul className={styles.links}>
          {chrome.navigation.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.year}>
        <p className={`${styles.label} t-label`}>{footer.yearLabel}</p>
        <p className={styles.link}>{footer.yearValue}</p>
      </div>

      <FooterCredits footer={footer} className={styles.bottom} />
    </footer>
  );
}
