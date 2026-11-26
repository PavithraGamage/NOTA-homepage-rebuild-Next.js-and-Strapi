import { describe, expect, it } from 'vitest';
import pluginsConfig from './plugins';

type Env = Parameters<typeof pluginsConfig>[0]['env'];

const envFrom = (values: Record<string, string>) =>
  ((key: string, fallback?: unknown) => values[key] ?? fallback) as unknown as Env;

const uploadConfig = (values: Record<string, string>) =>
  (pluginsConfig({ env: envFrom(values) }) as Record<string, any>).upload.config;

describe('upload provider', () => {
  const s3 = uploadConfig({
    S3_BUCKET: 'nota-media',
    S3_ENDPOINT: 'https://br-demo.storage.c-1.ap-southeast-1.aws.neon.tech',
    S3_REGION: 'ap-southeast-1',
    S3_PUBLIC_URL: 'https://br-demo.storage.c-1.ap-southeast-1.aws.neon.tech/nota-media',
  });

  it('keeps uploads on local disk when no bucket is set', () => {
    const local = uploadConfig({});
    expect(local.provider).toBeUndefined();
    expect(local.security.allowedTypes).toContain('image/*');
  });

  it('sends no ACL header, which Neon rejects, while keeping the key present so the provider adds none', () => {
    const { params } = s3.providerOptions.s3Options;
    expect('ACL' in params).toBe(true);
    expect(params.ACL).toBeUndefined();
  });

  it('sets a browser cache lifetime on every upload, without immutable, since a replaced file keeps its URL', () => {
    for (const action of ['upload', 'uploadStream'] as const) {
      const cacheControl = s3.actionOptions[action].CacheControl;
      expect(cacheControl).toMatch(/max-age=\d+/);
      expect(cacheControl).not.toContain('immutable');
    }
  });
});
