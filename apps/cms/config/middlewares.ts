import type { Core } from '@strapi/strapi';

/**
 * With uploads in object storage (config/plugins.ts), the admin's media library must be allowed to
 * show them. Strapi's defaults are repeated because these directives replace them.
 */
const security = (env: Core.Config.Shared.ConfigParams['env']) => {
  const publicUrl = env('S3_PUBLIC_URL');
  if (!env('S3_BUCKET') || !publicUrl || !URL.canParse(publicUrl)) return 'strapi::security';
  const storage = new URL(publicUrl).origin;
  const mediaSources = ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', storage];
  return {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: { 'img-src': mediaSources, 'media-src': mediaSources },
      },
    },
  };
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  security(env),
  {
    // The web app talks to Strapi server-side, so browsers never need CORS access.
    // We still restrict it to the site's origin instead of Strapi's permissive default.
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', ['http://localhost:3000']),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    // Raised for the product videos and the hero image sequence (a few MB each).
    name: 'strapi::body',
    config: {
      formLimit: '64mb',
      jsonLimit: '8mb',
      textLimit: '8mb',
      formidable: { maxFileSize: 64 * 1024 * 1024 },
    },
  },
  'strapi::session',
  'strapi::favicon',
  // Wraps the static file server so it can harden headers on /uploads/* responses.
  'global::upload-headers',
  'strapi::public',
];

export default config;
