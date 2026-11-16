import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './env';

const valid = {
  STRAPI_INTERNAL_URL: 'http://cms.railway.internal:1337',
  STRAPI_PUBLIC_URL: 'https://cms.example.up.railway.app',
  STRAPI_READ_TOKEN: 'r'.repeat(64),
  REVALIDATE_SECRET: 's'.repeat(64),
};

describe('parseServerEnv', () => {
  it('parses a valid environment and applies defaults', () => {
    const env = parseServerEnv(valid);
    expect(env.SITE_URL).toBe('http://localhost:3000');
    expect(env.STRAPI_FORM_TOKEN).toBeUndefined();
  });

  it('lists every problem in one readable error', () => {
    expect(() => parseServerEnv({ ...valid, STRAPI_INTERNAL_URL: 'not a url', REVALIDATE_SECRET: 'short' })).toThrow(
      /STRAPI_INTERNAL_URL[\s\S]*REVALIDATE_SECRET/,
    );
  });

  it('fails when a required secret is missing', () => {
    const { STRAPI_READ_TOKEN: _omitted, ...withoutToken } = valid;
    expect(() => parseServerEnv(withoutToken)).toThrow(/STRAPI_READ_TOKEN/);
  });
});
