import { describe, expect, it } from 'vitest';
import { CACHE_TAGS, tagsForWebhook, webhookPayloadSchema } from './tags';

describe('tagsForWebhook', () => {
  it('expires only the matching content type tag', () => {
    expect(tagsForWebhook({ event: 'entry.publish', uid: 'api::global.global' })).toEqual([CACHE_TAGS.global]);
    expect(tagsForWebhook({ event: 'entry.unpublish', uid: 'api::homepage.homepage' })).toEqual([CACHE_TAGS.homepage]);
    expect(tagsForWebhook({ event: 'entry.delete', uid: 'api::product.product' })).toEqual([CACHE_TAGS.product]);
  });

  it('expires everything for media changes, because file URLs change', () => {
    expect(tagsForWebhook({ event: 'media.update' })).toEqual([CACHE_TAGS.all]);
    expect(tagsForWebhook({ event: 'media.delete' })).toEqual([CACHE_TAGS.all]);
  });

  it('falls back to everything for unknown content types', () => {
    expect(tagsForWebhook({ event: 'entry.publish', uid: 'api::new-thing.new-thing' })).toEqual([CACHE_TAGS.all]);
  });

  it('ignores the admin "Trigger" test event', () => {
    expect(tagsForWebhook({ event: 'trigger-test' })).toEqual([]);
  });
});

describe('webhookPayloadSchema', () => {
  it('accepts a real Strapi entry payload and drops fields we do not use', () => {
    const parsed = webhookPayloadSchema.parse({
      event: 'entry.publish',
      createdAt: '2026-11-16T10:00:00.000Z',
      model: 'global',
      uid: 'api::global.global',
      entry: { id: 1, documentId: 'abc', siteName: 'NŌTA' },
    });
    expect(parsed).toEqual({ event: 'entry.publish', model: 'global', uid: 'api::global.global' });
  });

  it('rejects a payload without an event', () => {
    expect(webhookPayloadSchema.safeParse({ uid: 'api::global.global' }).success).toBe(false);
  });
});
