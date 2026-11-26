import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from './proxy';

const directives = (policy: string) => Object.fromEntries(policy.split('; ').map((d) => [d.split(' ')[0], d]));

describe('contentSecurityPolicy', () => {
  it('locks scripts to our nonce in production and allows the CMS for media', () => {
    const csp = directives(
      contentSecurityPolicy('abc', {
        NODE_ENV: 'production',
        SITE_URL: 'https://www.example.com',
        STRAPI_PUBLIC_URL: 'https://cms.example.com/path',
      }),
    );
    expect(csp['script-src']).toBe("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp['img-src']).toContain('https://cms.example.com');
    expect(csp['media-src']).toContain('https://cms.example.com');
    expect(csp['connect-src']).toBe("connect-src 'self' https://cms.example.com");
    expect(csp['object-src']).toBe("object-src 'none'");
    expect(csp['upgrade-insecure-requests']).toBeDefined();
  });

  it('allows the media origin when uploads live in cloud storage', () => {
    const csp = directives(
      contentSecurityPolicy('abc', {
        NODE_ENV: 'production',
        STRAPI_PUBLIC_URL: 'https://cms.example.com',
        MEDIA_PUBLIC_URL: 'https://br-demo.storage.c-1.ap-southeast-1.aws.neon.tech/nota-media',
      }),
    );
    for (const directive of ['img-src', 'media-src', 'connect-src']) {
      expect(csp[directive]).toContain('https://br-demo.storage.c-1.ap-southeast-1.aws.neon.tech');
      expect(csp[directive]).not.toContain('nota-media');
    }
  });

  it('allows eval and the dev-server websocket only in development', () => {
    const csp = directives(
      contentSecurityPolicy('abc', { NODE_ENV: 'development', STRAPI_PUBLIC_URL: 'http://localhost:1337' }),
    );
    expect(csp['script-src']).toContain("'unsafe-eval'");
    expect(csp['connect-src']).toContain('ws:');
    expect(csp['upgrade-insecure-requests']).toBeUndefined();
  });

  it('upgrades insecure requests only when the site itself is on https', () => {
    const local = directives(
      contentSecurityPolicy('abc', { NODE_ENV: 'production', SITE_URL: 'http://localhost:3000' }),
    );
    expect(local['upgrade-insecure-requests']).toBeUndefined();
  });

  it('ignores a malformed CMS URL instead of emitting it', () => {
    const csp = directives(contentSecurityPolicy('abc', { NODE_ENV: 'production', STRAPI_PUBLIC_URL: 'https://' }));
    expect(csp['img-src']).toBe("img-src 'self' data: blob:");
  });
});
