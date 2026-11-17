import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
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
