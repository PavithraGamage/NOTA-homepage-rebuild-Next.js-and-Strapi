'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { joinWaitlist, type WaitlistState } from '@/app/actions/waitlist';
import type { WaitlistCopy } from '@/lib/content/types';
import { HONEYPOT_FIELD, validateEmail, type WaitlistFieldError, type WaitlistSource } from '@/lib/waitlist/schema';
import { Lines } from '@/components/ui/Lines';
import { useDialogBehaviour } from './useDialogBehaviour';
import { useWaitlist } from './WaitlistContext';
import styles from './WaitlistModal.module.css';

type WaitlistModalProps = { copy: WaitlistCopy };

/**
 * "Stay ahead" waitlist dialog (measured per range: white card, serif title, underline field,
 * black submit, grey Close). The form remounts on every open, so it always starts empty.
 */
export function WaitlistModal({ copy }: WaitlistModalProps) {
  const { isOpen, close, session, source } = useWaitlist();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogBehaviour(dialogRef, isOpen, close);

  return (
    <div className={styles.root} data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen}>
      <div className={styles.overlay} onClick={close} />
      <div ref={dialogRef} className={styles.card} role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <WaitlistForm key={session} copy={copy} source={source} />
        <button type="button" className={`${styles.close} t-ui`} onClick={close}>
          {copy.closeLabel}
        </button>
      </div>
    </div>
  );
}

const IDLE: WaitlistState = { status: 'idle' };

/**
 * States: idle → (browser check) → submitting → success, or an error shown in red like the
 * reference (field, message and button turn #ff2200). The browser check uses the same rules
 * as the Server Action, so most mistakes never leave the page; the server's answer wins.
 */
function WaitlistForm({ copy, source }: { copy: WaitlistCopy; source: WaitlistSource }) {
  const [state, formAction, pending] = useActionState(joinWaitlist, IDLE);
  const [localError, setLocalError] = useState<WaitlistFieldError | null>(null);
  const [serverErrorSeen, setServerErrorSeen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const serverError = state.status === 'error' && !serverErrorSeen ? state.error : null;
  const error = localError ?? serverError;
  const messages = { required: copy.errorRequired, invalid: copy.errorInvalidEmail, generic: copy.errorGeneric };

  // Announce the result: focus the success title, or return to the field after an error.
  useEffect(() => {
    if (state.status === 'success') titleRef.current?.focus();
    else if (state.status === 'error') inputRef.current?.focus();
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const check = validateEmail(new FormData(event.currentTarget).get('email'));
    if (!check.ok) {
      event.preventDefault();
      setLocalError(check.error);
      inputRef.current?.focus();
      return;
    }
    setLocalError(null);
    setServerErrorSeen(false);
  };

  // Typing clears the red state until the next submit.
  const onInput = () => {
    setLocalError(null);
    if (state.status === 'error') setServerErrorSeen(true);
  };

  if (state.status === 'success') {
    return (
      <div role="status">
        <h2 id="waitlist-title" ref={titleRef} tabIndex={-1} className={`${styles.title} t-display`}>
          {copy.successTitle}
        </h2>
        <p className={`${styles.subtitle} t-body`}>{copy.successMessage}</p>
      </div>
    );
  }

  return (
    <>
      <h2 id="waitlist-title" className={`${styles.title} t-display`}>
        {copy.title}
      </h2>
      <p id="waitlist-subtitle" className={`${styles.subtitle} t-body`}>
        <Lines lines={copy.subtitle} breaks="always" />
      </p>

      <form
        className={styles.form}
        action={formAction}
        onSubmit={onSubmit}
        noValidate
        data-state={error ? 'error' : pending ? 'pending' : 'idle'}
        aria-describedby="waitlist-subtitle"
      >
        <label htmlFor="waitlist-email" className="visually-hidden">
          {copy.emailPlaceholder}
        </label>
        <input
          ref={inputRef}
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder={copy.emailPlaceholder}
          className={`${styles.input} t-ui`}
          aria-invalid={error ? true : undefined}
          aria-describedby="waitlist-error"
          onInput={onInput}
        />
        <input type="hidden" name="source" value={source} />
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="waitlist-company">Company</label>
          <input id="waitlist-company" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <p id="waitlist-error" className={styles.error} role="alert">
          {error ? messages[error] : null}
        </p>
        <button type="submit" className={`${styles.submit} t-ui`} disabled={pending} aria-busy={pending}>
          {copy.submitLabel}
          <span className={styles.dot} aria-hidden="true" />
        </button>
      </form>
    </>
  );
}
