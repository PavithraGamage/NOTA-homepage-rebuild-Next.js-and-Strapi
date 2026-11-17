'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { SiteChrome } from '@/lib/content/types';
import { INTRO_DONE_EVENT } from '@/lib/animation/loading';
import { scramble } from '@/lib/animation/scramble';
import { MenuIcon } from '@/components/ui/icons';
import { Wordmark } from '@/components/ui/Wordmark';
import { MobileMenu } from './MobileMenu';
import { OrderButton } from './OrderButton';
import { useHeaderBehaviour } from './useHeaderBehaviour';
import styles from './Header.module.css';

type HeaderProps = { chrome: SiteChrome };

/**
 * Fixed header. Large screens: wordmark, anchor navigation and the order panel. Tablets and
 * phones: wordmark, menu button and brand mark; the menu holds navigation and the order button.
 */
export function Header({ chrome }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useHeaderBehaviour(ref);

  // After the intro, the nav labels scramble once and resolve (measured: on load only, ~0.7s).
  useEffect(() => {
    const onIntro = () =>
      ref.current?.querySelectorAll<HTMLElement>('[data-scramble]').forEach((label) => scramble(label));
    window.addEventListener(INTRO_DONE_EVENT, onIntro, { once: true });
    return () => window.removeEventListener(INTRO_DONE_EVENT, onIntro);
  }, []);

  return (
    <>
      <header ref={ref} className={styles.header} data-theme="dark">
        <a href="#top" className={styles.home}>
          <Wordmark logo={chrome.logo} label={chrome.siteName} className={styles.wordmark} />
        </a>

        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.navList}>
            {chrome.navigation.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={`${styles.navLink} t-ui`} data-scramble>
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
