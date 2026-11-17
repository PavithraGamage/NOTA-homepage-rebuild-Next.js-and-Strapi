'use client';

import { useCallback, useRef, useState } from 'react';
import type { FooterCredit, SiteChrome } from '@/lib/content/types';
import { CloseIcon } from '@/components/ui/icons';
import { useDialogBehaviour } from './useDialogBehaviour';
import styles from './FooterCredits.module.css';

type FooterCreditsProps = { footer: SiteChrome['footer']; variant?: 'footer' | 'menu'; className?: string };

/**
 * Copyright plus the credits row. Credits come in pairs like the reference: the first pair is
 * joined by a dot ("Made in Taptop • Builded by NōtaTeam"), the second reads as one line
 * ("Designed by Alice & UPROCK Studio"). A credit marked "opens team list" shows the popover.
 * The mobile menu repeats the credits on white, with tighter rows and a grey dot.
 */
export function FooterCredits({ footer, variant = 'footer', className }: FooterCreditsProps) {
  const [teamOpen, setTeamOpen] = useState(false);
  const close = useCallback(() => setTeamOpen(false), []);
  const half = Math.ceil(footer.credits.length / 2);
  const groups = [footer.credits.slice(0, half), footer.credits.slice(half)];

  const renderCredit = (credit: FooterCredit) =>
    credit.opensTeam ? (
      <span className={styles.anchor} key={credit.label}>
        <button
          type="button"
          className={styles.credit}
          aria-expanded={teamOpen}
          aria-controls="team-credits"
          onClick={() => setTeamOpen((v) => !v)}
        >
          {credit.label}
        </button>
        <TeamPopover team={footer.team} open={teamOpen} onClose={close} closeLabel={footer.popoverCloseLabel} />
      </span>
    ) : credit.href ? (
      <a key={credit.label} href={credit.href} className={styles.credit} target="_blank" rel="noopener noreferrer">
        {credit.label}
      </a>
    ) : (
      <span key={credit.label} className={styles.credit}>
        {credit.label}
      </span>
    );

  return (
    <div className={`${styles.credits} ${variant === 'menu' ? styles.menu : ''} ${className ?? ''}`}>
      <p className={`${styles.copyright} t-label`}>{footer.copyright}</p>
      <div className={`${styles.group} ${styles.dotted}`}>
        {groups[0].map((credit, index) => (
          <span key={credit.label} className={styles.item}>
            {index > 0 && <span className={styles.dot} aria-hidden="true" />}
            {renderCredit(credit)}
          </span>
        ))}
      </div>
      <div className={`${styles.group} ${styles.spaced}`}>{groups[1].map(renderCredit)}</div>
    </div>
  );
}

type TeamPopoverProps = { team: string[][]; open: boolean; onClose: () => void; closeLabel: string };

function TeamPopover({ team, open, onClose, closeLabel }: TeamPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogBehaviour(ref, open, onClose);
  if (!open) return null;
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div id="team-credits" ref={ref} className={styles.popover} role="dialog" aria-modal="true" aria-label="Team">
        <button type="button" className={styles.popoverClose} aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
        {team.map((group, index) => (
          <ul key={index} className={styles.names}>
            {group.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ))}
      </div>
    </>
  );
}
