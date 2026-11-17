import { describe, expect, it } from 'vitest';
import { WEBHOOK_NAME, buildWebhook, pageContentTypeUids } from './revalidate-webhook';

describe('pageContentTypeUids', () => {
  it('keeps only our Draft & Publish content types, so form entries never trigger revalidation', () => {
    const uids = pageContentTypeUids({
      'api::homepage.homepage': { options: { draftAndPublish: true } },
      'api::global.global': { options: { draftAndPublish: true } },
      'api::waitlist-signup.waitlist-signup': { options: { draftAndPublish: false } },
      'plugin::upload.file': { options: { draftAndPublish: false } },
      'admin::user': {},
    });
    expect(uids).toEqual(['api::global.global', 'api::homepage.homepage']);
  });
});

describe('buildWebhook', () => {
  const webhook = buildWebhook('http://web.railway.internal:3000/api/revalidate', 'secret-value', ['api::global.global']);

  it('authenticates with the shared secret as a bearer token', () => {
    expect(webhook.headers).toEqual({ Authorization: 'Bearer secret-value' });
  });

  it('fires media events for everything and publish events per content type, never draft saves', () => {
    expect(webhook.events).toEqual(['media.update', 'media.delete']);
    expect(webhook.contentTypeEvents).toEqual({ 'api::global.global': ['entry.publish', 'entry.unpublish', 'entry.delete'] });
    expect(JSON.stringify(webhook)).not.toContain('entry.update');
  });

  it('uses a stable name so every boot updates the same webhook', () => {
    expect(webhook.name).toBe(WEBHOOK_NAME);
    expect(webhook.isEnabled).toBe(true);
  });
});
