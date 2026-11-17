'use server';

import { headers } from 'next/headers';
import { createWaitlistSignup } from '@/lib/strapi/waitlist';
import { createRateLimiter } from '@/lib/waitlist/rate-limit';
import { HONEYPOT_FIELD, validateEmail, waitlistSourceSchema, type WaitlistFieldError } from '@/lib/waitlist/schema';

export type WaitlistState =
  { status: 'idle' } | { status: 'success' } | { status: 'error'; error: WaitlistFieldError | 'generic' };

/**
 * Five signups per visitor every ten minutes in production (a person needs one); generous in
 * development so repeated local tests don't trip it. In memory: one web instance on Railway.
 */
const allow = createRateLimiter({
  limit: process.env.NODE_ENV === 'production' ? 5 : 100,
  windowMs: 10 * 60 * 1000,
});

/**
 * "Stay ahead" form → Strapi. Next.js already rejects cross-origin posts (CSRF) and large
 * bodies; this adds the honeypot, validation (same rules as the browser), a per-IP rate
 * limit, then a create with the create-only token. The visitor only ever sees success or a
 * generic error code: duplicates count as success, and Strapi details stay in the logs.
 */
export async function joinWaitlist(_previous: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Bots that fill every input get a quiet "success" and nothing is stored.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim()) return { status: 'success' };

  const email = validateEmail(formData.get('email'));
  if (!email.ok) return { status: 'error', error: email.error };

  if (!allow(await clientAddress())) {
    console.warn('[waitlist] rate limit reached');
    return { status: 'error', error: 'generic' };
  }

  const source = waitlistSourceSchema.catch('header-cta').parse(formData.get('source'));
  const outcome = await createWaitlistSignup({ email: email.email, source });
  return outcome === 'failed' ? { status: 'error', error: 'generic' } : { status: 'success' };
}

/** Railway's edge puts the visitor's address first in X-Forwarded-For. */
async function clientAddress(): Promise<string> {
  const list = await headers();
  return list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'unknown';
}
