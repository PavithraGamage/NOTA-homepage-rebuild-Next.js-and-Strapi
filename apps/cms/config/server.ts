import type { Core } from '@strapi/strapi';

const requireAppKeys = (keys: string[] | undefined): string[] => {
  if (!keys?.length) {
    throw new Error('APP_KEYS is required: a comma-separated list of random strings (see .env.example).');
  }
  return keys;
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  // On Railway HOST is "::" so the server accepts IPv6 (private network) as well as IPv4.
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public origin of the CMS. Strapi uses it for admin URLs and absolute links.
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  // Railway terminates TLS at its edge and forwards plain HTTP; trusting X-Forwarded-*
  // lets Koa see the original https scheme so secure admin cookies are issued.
  proxy: { koa: env.bool('TRUST_PROXY', false) },
  app: {
    keys: requireAppKeys(env.array('APP_KEYS')),
  },
  webhooks: {
    // The web app only needs to know *what* changed, not the full related documents.
    populateRelations: false,
  },
});

export default config;
