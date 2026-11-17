'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { SiteChrome } from '@/lib/content/types';
import { MenuIcon } from '@/components/ui/icons';
import { Wordmark } from '@/components/ui/Wordmark';
import { MobileMenu } from './MobileMenu';
import { OrderButton } from './OrderButton';
import styles from './Header.module.css';

type HeaderProps = { chrome: SiteChrome };

/**
 * Fixed header. Large screens: wordmark, anchor navigation and the order panel. Tablets and
 * phones: wordmark, menu button and brand mark; the menu holds navigation and the order button.
 */
export function Header({ chrome }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header} data-theme="dark">
        <a href="#top" className={styles.home}>
          <Wordmark logo={chrome.logo} label={chrome.siteName} className={styles.wordmark} />
        </a>

        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.navList}>
            {chrome.navigation.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={`${styles.navLink} t-ui`}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.panel}>
          <Image src={chrome.brandMark.url} alt="" width={38} height={40} unoptimized className={styles.panelMark} />
          <OrderButton cta={chrome.orderCta} source="header-cta" />
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
        <Image src={chrome.brandMark.url} alt="" width={25} height={26} unoptimized className={styles.mobileMark} />
      </header>

      <MobileMenu chrome={chrome} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
