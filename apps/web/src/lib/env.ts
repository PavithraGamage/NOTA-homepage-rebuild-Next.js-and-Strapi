import 'server-only';
import { z } from 'zod';

/**
 * Server-side environment. Tokens and secrets live here and are never prefixed with
 * NEXT_PUBLIC_, so they cannot end up in the browser bundle (`server-only` enforces it).
 */
export const serverEnvSchema = z.object({
  /** Strapi over Railway's private network, e.g. http://cms.railway.internal:1337 */
  STRAPI_INTERNAL_URL: z.url(),
  /** Strapi's public origin, used to build absolute media URLs for the browser. */
  STRAPI_PUBLIC_URL: z.url(),
  /** Read-only API token for published content. */
  STRAPI_READ_TOKEN: z.string().min(20, 'STRAPI_READ_TOKEN looks too short'),
  /** Create-only token for waitlist entries (required from Phase 5). */
  STRAPI_FORM_TOKEN: z.string().min(20).optional(),
  /** Shared with Strapi's webhook; authenticates POST /api/revalidate. */
  REVALIDATE_SECRET: z.string().min(32, 'REVALIDATE_SECRET must be at least 32 characters'),
  /** Public URL of this site, used for canonical/metadata URLs. */
  SITE_URL: z.url().default('http://localhost:3000'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Validates a raw env object and turns Zod issues into one readable error. */
export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid server environment variables:\n${problems}`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/**
 * Lazily parsed so `next build` (which has no secrets in CI) can import modules safely.
 * instrumentation.ts calls this at server start, so a bad deploy fails immediately.
 */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
