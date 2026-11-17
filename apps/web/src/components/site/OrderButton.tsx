'use client';

import type { OrderCta } from '@/lib/content/types';
import { useWaitlist, type WaitlistSource } from './WaitlistContext';
import styles from './OrderButton.module.css';

type OrderButtonProps = {
  cta: OrderCta;
  source: WaitlistSource;
  /** "solid": black header button. "glass": translucent pill on the mobile-menu image. */
  variant?: 'solid' | 'glass';
};

/** "Order · Nota One · $300": label from the CMS, name and price from the linked product. */
export function OrderButton({ cta, source, variant = 'solid' }: OrderButtonProps) {
  const { open } = useWaitlist();
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} t-ui`}
      onClick={() => open(source)}
      aria-haspopup="dialog"
    >
      <span>{cta.label}</span> <span className={styles.product}>{cta.productName}</span>
      <span className={styles.dot} aria-hidden="true" />
      <span>{cta.priceLabel}</span>
    </button>
  );
}
