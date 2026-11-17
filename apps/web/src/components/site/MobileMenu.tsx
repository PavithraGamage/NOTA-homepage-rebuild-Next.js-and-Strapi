'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { SiteChrome } from '@/lib/content/types';
import { CloseIcon } from '@/components/ui/icons';
import { Picture } from '@/components/ui/Picture';
import { Wordmark } from '@/components/ui/Wordmark';
import { useDialogBehaviour } from './useDialogBehaviour';
import { OrderButton } from './OrderButton';
import { FooterCredits } from './FooterCredits';
import styles from './MobileMenu.module.css';

type MobileMenuProps = { chrome: SiteChrome; open: boolean; onClose: () => void };

/** Full-screen menu for tablets and phones (measured at 320: 56px bar, centred links, oval image). */
export function MobileMenu({ chrome, open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehaviour(panelRef, open, onClose);

  // Following a link closes the menu; the browser then scrolls to the section.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('a[href^="#"]')) onClose();
    };
    panel.addEventListener('click', onClick);
    return () => panel.removeEventListener('click', onClick);
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={styles.menu}
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className={styles.bar}>
        <Wordmark logo={chrome.logo} label={chrome.siteName} className={styles.wordmark} />
        <button type="button" className={styles.close} aria-label="Close menu" onClick={onClose}>
          <CloseIcon bold />
        </button>
        <Image src={chrome.brandMark.url} alt="" width={25} height={26} unoptimized className={styles.mark} />
      </div>

      <nav aria-label="Menu">
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

      <div className={styles.feature}>
        <Picture image={chrome.mobileMenuImage} sizes="(max-width: 767px) 94vw, 96vw" className={styles.featureImage} />
        <div className={styles.cta}>
          <OrderButton cta={chrome.orderCta} source="mobile-menu-cta" variant="glass" />
        </div>
      </div>

      <FooterCredits footer={chrome.footer} variant="menu" className={styles.credits} />
    </div>
  );
}
