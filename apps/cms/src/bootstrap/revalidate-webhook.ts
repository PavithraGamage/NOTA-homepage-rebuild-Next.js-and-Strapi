import type { Core, Modules } from '@strapi/strapi';

type Webhook = Modules.WebhookStore.Webhook;

/** Stable name so every boot finds and updates the same webhook instead of creating duplicates. */
export const WEBHOOK_NAME = 'Revalidate website (managed in code)';

/**
 * Events that can change what a visitor sees. With Draft & Publish on, saving a draft
 * (`entry.update`) does not change the published content, so it is deliberately left out.
 */
const PUBLISHED_CONTENT_EVENTS = ['entry.publish', 'entry.unpublish', 'entry.delete'];

/** A replaced or deleted file changes its URL, so media events apply to every content type. */
const MEDIA_EVENTS = ['media.update', 'media.delete'];

/**
 * Content types that feed the website: our own API types with Draft & Publish enabled.
 * Form entries (Draft & Publish off) are excluded, so a waitlist signup never purges the cache.
 */
type ContentTypeLike = { options?: { draftAndPublish?: boolean } };

export const pageContentTypeUids = (contentTypes: object): string[] =>
  // Only `options.draftAndPublish` is read, which every Strapi content type schema has.
  (Object.entries(contentTypes) as [string, ContentTypeLike][])
    .filter(([uid, ct]) => uid.startsWith('api::') && ct.options?.draftAndPublish === true)
    .map(([uid]) => uid)
    .sort();

export const buildWebhook = (
  url: string,
  secret: string,
  contentTypeUids: string[],
): Omit<Webhook, 'id'> => ({
  name: WEBHOOK_NAME,
  url,
  headers: { Authorization: `Bearer ${secret}` },
  events: MEDIA_EVENTS,
  contentTypeEvents: Object.fromEntries(contentTypeUids.map((uid) => [uid, PUBLISHED_CONTENT_EVENTS])),
  isEnabled: true,
});

/**
 * Creates or updates the revalidation webhook from environment variables on every boot.
 * This keeps the webhook reproducible across environments while still showing it under
 * Settings → Webhooks, where editors can see what fires and test it.
 */
export async function provisionRevalidateWebhook(strapi: Core.Strapi): Promise<void> {
  const url = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    strapi.log.warn('[revalidate-webhook] WEB_REVALIDATE_URL or REVALIDATE_SECRET not set; skipping provisioning.');
    return;
  }

  const store: Modules.WebhookStore.WebhookStore = strapi.get('webhookStore');
  const runner = strapi.get('webhookRunner');
  const desired = buildWebhook(url, secret, pageContentTypeUids(strapi.contentTypes));
  const existing = (await store.findWebhooks()).find((webhook) => webhook.name === WEBHOOK_NAME);

  // Strapi's own webhook provider has already loaded stored webhooks into the runner before
  // our bootstrap runs, so the runner must be told about any change made here.
  if (existing) {
    const updated = await store.updateWebhook(existing.id, { ...desired, id: existing.id });
    if (updated) runner.update(updated);
    strapi.log.info(`[revalidate-webhook] updated → ${url}`);
  } else {
    // The database assigns the id; the store ignores this placeholder.
    const created = await store.createWebhook({ ...desired, id: '' });
    runner.add(created);
    strapi.log.info(`[revalidate-webhook] created → ${url}`);
  }
}
