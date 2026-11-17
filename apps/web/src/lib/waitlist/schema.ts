import { z } from 'zod';

/**
 * The waitlist form's rules, shared by the browser (instant feedback) and the Server Action
 * (the real check). Strapi enforces them a third time: email type, required, unique, max 254.
 * Errors are codes; the messages come from the CMS (Global → Waitlist modal).
 */
export const WAITLIST_SOURCES = ['header-cta', 'mobile-menu-cta'] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];
export const waitlistSourceSchema = z.enum(WAITLIST_SOURCES);

export type WaitlistFieldError = 'required' | 'invalid';

/** A field real visitors never see or fill; bots that complete every input do. */
export const HONEYPOT_FIELD = 'company';

const emailSchema = z.email().max(254);

/** Trims and lower-cases, so "Me@Example.com " and "me@example.com" are one signup. */
export function validateEmail(raw: unknown): { ok: true; email: string } | { ok: false; error: WaitlistFieldError } {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return { ok: false, error: 'required' };
  const parsed = emailSchema.safeParse(value.toLowerCase());
  return parsed.success ? { ok: true, email: parsed.data } : { ok: false, error: 'invalid' };
}
