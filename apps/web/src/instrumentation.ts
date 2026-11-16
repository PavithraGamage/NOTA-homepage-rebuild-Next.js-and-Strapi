/**
 * Runs once when a Next.js server instance starts. Validating env here means a deploy with
 * missing or malformed variables crashes at boot (Railway's healthcheck then keeps the
 * previous deployment live) instead of failing on the first visitor's request.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getServerEnv } = await import('./lib/env');
    getServerEnv();
  }
}
