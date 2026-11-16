/**
 * Liveness check for Railway's deploy healthcheck. Deliberately does not call Strapi:
 * a CMS outage should not stop a new web deployment from going live, because the site
 * can still serve cached content.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
