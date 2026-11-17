import 'server-only';
import { getServerEnv } from '@/lib/env';
import type { WaitlistSource } from '@/lib/waitlist/schema';

export type SignupOutcome = 'created' | 'duplicate' | 'failed';

/**
 * Reads Strapi's answer to a create. A 400 whose only problem is the unique email means the
 * address is already on the list; we report that as success to the visitor, so the form
 * never reveals which addresses are registered.
 */
export function classifySignupResponse(status: number, body: unknown): SignupOutcome {
  if (status >= 200 && status < 300) return 'created';
  if (status !== 400) return 'failed';
  const errors = (body as { error?: { details?: { errors?: { path?: unknown[]; message?: string }[] } } })?.error
    ?.details?.errors;
  const onlyUniqueEmail =
    Array.isArray(errors) &&
    errors.length > 0 &&
    errors.every((error) => error.path?.[0] === 'email' && /unique/i.test(error.message ?? ''));
  return onlyUniqueEmail ? 'duplicate' : 'failed';
}

/**
 * Creates a waitlist entry with the create-only token (it can do nothing else, and the
 * Public role has no permissions at all). Never throws: failures are logged without the
 * visitor's address and reported as 'failed'.
 */
export async function createWaitlistSignup(entry: { email: string; source: WaitlistSource }): Promise<SignupOutcome> {
  const env = getServerEnv();
  if (!env.STRAPI_FORM_TOKEN) {
    console.error('[waitlist] STRAPI_FORM_TOKEN is not set; cannot store signups');
    return 'failed';
  }
  try {
    const response = await fetch(new URL('/api/waitlist-signups', env.STRAPI_INTERNAL_URL), {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.STRAPI_FORM_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: entry }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const body: unknown = await response.json().catch(() => null);
    const outcome = classifySignupResponse(response.status, body);
    if (outcome === 'failed') console.error(`[waitlist] Strapi responded ${response.status} to a signup`);
    return outcome;
  } catch (error) {
    console.error(`[waitlist] Strapi unreachable: ${String(error)}`);
    return 'failed';
  }
}
