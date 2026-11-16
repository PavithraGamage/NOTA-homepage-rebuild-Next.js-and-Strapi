import { describe, expect, it } from 'vitest';
import { globalResponseSchema, toSiteGlobal } from './global';

describe('global response → view model', () => {
  it('maps a Strapi 5 response to a plain view model', () => {
    const response = globalResponseSchema.parse({
      data: { id: 3, documentId: 'kx1', siteName: 'NŌTA', createdAt: '…', publishedAt: '…' },
      meta: {},
    });
    expect(toSiteGlobal(response)).toEqual({ siteName: 'NŌTA' });
  });

  it('rejects an empty site name', () => {
    expect(globalResponseSchema.safeParse({ data: { documentId: 'kx1', siteName: '' } }).success).toBe(false);
  });
});
