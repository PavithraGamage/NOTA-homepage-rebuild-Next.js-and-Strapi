import { NextResponse, type NextRequest } from 'next/server';

/**
 * Content-Security-Policy with a fresh nonce per request (the page already renders per request).
 * Next.js reads the nonce from this header and puts it on its own scripts, so only our bundles
 * run: no inline or third-party script can execute. Media, the hero sequence and the favicon
 * come from Strapi's public origin, or from cloud storage (MEDIA_PUBLIC_URL) when uploads live
 * there. Styles allow inline because React renders a few `style`
 * attributes (colourway text colours, step stacking), which nonces cannot cover.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = contentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export function contentSecurityPolicy(nonce: string, env: Partial<Record<string, string>> = process.env): string {
  const development = env.NODE_ENV === 'development';
  const cms = origin(env.STRAPI_PUBLIC_URL);
  // Cloud storage for uploads (e.g. Cloudinary), when media isn't served by Strapi itself.
  const media = origin(env.MEDIA_PUBLIC_URL);
  // Only on an https site: WebKit also upgrades http://localhost, which breaks local builds.
  const httpsSite = env.SITE_URL?.startsWith('https://') ?? false;
  const directives: (string | false)[][] = [
    ['default-src', "'self'"],
    // React needs eval only in development (error overlays); never in production.
    ['script-src', "'self'", `'nonce-${nonce}'`, "'strict-dynamic'", development && "'unsafe-eval'"],
    ['style-src', "'self'", "'unsafe-inline'"],
    ['img-src', "'self'", 'data:', 'blob:', cms, media],
    ['media-src', "'self'", cms, media],
    ['connect-src', "'self'", cms, media, development && 'ws:'],
    ['font-src', "'self'"],
    ['object-src', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['frame-ancestors', "'self'"],
    httpsSite ? ['upgrade-insecure-requests'] : [],
  ];
  return directives
    .map((parts) => parts.filter(Boolean).join(' '))
    .filter(Boolean)
    .join('; ');
}

function origin(url: string | undefined): string | false {
  if (!url || !URL.canParse(url)) return false;
  return new URL(url).origin;
}

export const config = {
  matcher: [
    {
      // Pages only: API routes, build assets and optimised images don't need the header.
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
