import 'server-only';
import type { z } from 'zod';
import { getServerEnv } from '@/lib/env';
import { CACHE_TAGS, type CacheTag } from './tags';

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

/**
 * Last successful payload per URL, kept in memory. If Strapi is briefly unreachable
 * (e.g. its volume-backed redeploy), we serve the last good content instead of an error.
 */
const lastKnownGood = new Map<string, unknown>();

type StrapiGetOptions<TSchema extends z.ZodType> = {
  /** Path under /api, e.g. "global". */
  path: string;
  /** Query string built by the caller (populate, filters). */
  query?: string;
  /** Validates and types the response; section components never see raw Strapi shapes. */
  schema: TSchema;
  /** Specific tag for on-demand revalidation (the umbrella tag is always added). */
  tag: CacheTag;
};

/**
 * Fetches published content from Strapi over the private network.
 *
 * Caching: `force-cache` + tags stores the response in Next's data cache until the
 * Strapi webhook calls revalidateTag(tag, { expire: 0 }); the next request then refetches
 * before rendering, so the first page load after publishing shows the new content.
 */
export async function strapiGet<TSchema extends z.ZodType>({
  path,
  query,
  schema,
  tag,
}: StrapiGetOptions<TSchema>): Promise<z.infer<TSchema>> {
  const env = getServerEnv();
  const url = new URL(`/api/${path}${query ? `?${query}` : ''}`, env.STRAPI_INTERNAL_URL).toString();

  let json: unknown;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.STRAPI_READ_TOKEN}` },
      cache: 'force-cache',
      next: { tags: [CACHE_TAGS.all, tag] },
    });
    if (!response.ok) {
      throw new StrapiError(`Strapi responded ${response.status} for /api/${path}`, response.status);
    }
    json = await response.json();
  } catch (error) {
    // Only network failures and 5xx fall back; a 4xx means our request or token is wrong.
    const status = error instanceof StrapiError ? error.status : undefined;
    const isOutage = status === undefined || status >= 500;
    if (isOutage && lastKnownGood.has(url)) {
      console.warn(`[strapi] ${String(error)}; serving last known good content for /api/${path}`);
      return lastKnownGood.get(url) as z.infer<TSchema>;
    }
    throw error instanceof StrapiError
      ? error
      : new StrapiError(`Strapi unreachable for /api/${path}: ${String(error)}`);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new StrapiError(`Unexpected Strapi response for /api/${path}: ${parsed.error.message}`);
  }
  lastKnownGood.set(url, parsed.data);
  return parsed.data;
}
