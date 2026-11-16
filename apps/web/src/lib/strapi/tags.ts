import { z } from 'zod';

/**
 * Cache tags for Strapi data. Every request is tagged with ALL plus its own tag, so one
 * content type can be refreshed on its own while media changes refresh everything.
 */
export const CACHE_TAGS = {
  all: 'strapi',
  global: 'strapi:global',
  homepage: 'strapi:homepage',
  product: 'strapi:product',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

const TAG_BY_CONTENT_TYPE: Record<string, CacheTag> = {
  'api::global.global': CACHE_TAGS.global,
  'api::homepage.homepage': CACHE_TAGS.homepage,
  'api::product.product': CACHE_TAGS.product,
};

/** The parts of Strapi's webhook payload we rely on; anything else is ignored. */
export const webhookPayloadSchema = z.object({
  event: z.string(),
  uid: z.string().optional(),
  model: z.string().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

/**
 * Maps a webhook event to the tags to expire.
 * - `trigger-test` (the admin's "Trigger" button) expires nothing.
 * - Media changes alter file URLs anywhere on the page, so they expire everything.
 * - A known content type expires its own tag; an unknown one falls back to everything,
 *   because a stale page is worse than one extra cache miss.
 */
export function tagsForWebhook(payload: WebhookPayload): CacheTag[] {
  if (payload.event === 'trigger-test') return [];
  if (payload.event.startsWith('media.')) return [CACHE_TAGS.all];
  const tag = payload.uid ? TAG_BY_CONTENT_TYPE[payload.uid] : undefined;
  return [tag ?? CACHE_TAGS.all];
}
