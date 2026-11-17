'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behaviour for the menu, waitlist form and credits: Escape closes, focus moves
 * into the dialog and is trapped there, focus returns to the opener on close, and the page
 * behind stops scrolling (via a class, so scroll-driven animations keep their positions).
 */
export function useDialogBehaviour(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;

    const opener = document.activeElement as HTMLElement | null;
    const focusables = () => [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
    focusables()[0]?.focus({ preventScroll: true });
    document.documentElement.classList.add('scroll-locked');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('scroll-locked');
      opener?.focus({ preventScroll: true });
    };
  }, [ref, open, onClose]);
}
