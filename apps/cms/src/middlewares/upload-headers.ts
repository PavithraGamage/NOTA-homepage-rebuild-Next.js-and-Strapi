import type { Core } from '@strapi/strapi';

/**
 * Hardens responses for uploaded media (/uploads/*).
 * - `sandbox` + `default-src 'none'`: an uploaded SVG opened directly on the CMS domain
 *   cannot run scripts or load anything, so allowing SVG uploads is safe.
 * - `nosniff`: browsers must respect the stored Content-Type.
 * - Long cache: Strapi gives every upload a unique hashed file name, so a replaced image gets
 *   a new URL instead of a stale cached copy.
 */
const uploadHeaders: Core.MiddlewareFactory = () => async (ctx, next) => {
  await next();
  if (ctx.path.startsWith('/uploads/') && ctx.status === 200) {
    ctx.set('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
    ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
};

export default uploadHeaders;
