'use client';

import { useRef } from 'react';
import type { WaitlistCopy } from '@/lib/content/types';
import { Lines } from '@/components/ui/Lines';
import { useDialogBehaviour } from './useDialogBehaviour';
import { useWaitlist } from './WaitlistContext';
import styles from './WaitlistModal.module.css';

type WaitlistModalProps = { copy: WaitlistCopy };

/**
 * "Stay ahead" waitlist dialog (measured at 1440: 550x460 white card, serif title, underline
 * field, black submit, grey Close). Submission is wired in the form phase.
 */
export function WaitlistModal({ copy }: WaitlistModalProps) {
  const { isOpen, close } = useWaitlist();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogBehaviour(dialogRef, isOpen, close);

  return (
    <div className={styles.root} data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen}>
      <div className={styles.overlay} onClick={close} />
      <div
        ref={dialogRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        aria-describedby="waitlist-subtitle"
      >
        <h2 id="waitlist-title" className="t-display">
          {copy.title}
        </h2>
        <p id="waitlist-subtitle" className={`${styles.subtitle} t-body`}>
          <Lines lines={copy.subtitle} breaks="always" />
        </p>

        <form className={styles.form} noValidate onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="waitlist-email" className="visually-hidden">
            {copy.emailPlaceholder}
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={copy.emailPlaceholder}
            className={`${styles.input} t-ui`}
            aria-describedby="waitlist-error"
          />
          <p id="waitlist-error" className={styles.error} role="alert" />
          <button type="submit" className={`${styles.submit} t-ui`}>
            {copy.submitLabel}
            <span className={styles.dot} aria-hidden="true" />
          </button>
        </form>

        <button type="button" className={`${styles.close} t-ui`} onClick={close}>
          {copy.closeLabel}
        </button>
      </div>
    </div>
  );
}
