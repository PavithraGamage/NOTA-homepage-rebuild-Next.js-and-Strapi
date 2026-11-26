import type { NextConfig } from 'next';

/**
 * Media is served from Strapi's public domain; next/image must be allowed to fetch it.
 * Read at build time (the allow-list is compiled in), so a missing value falls back to the
 * local CMS for CI, while a malformed one (e.g. "https://" before Railway has generated the
 * CMS domain) stops the build with an explanation.
 */
const rawStrapiPublicUrl = process.env.STRAPI_PUBLIC_URL || 'http://localhost:1337';
if (!URL.canParse(rawStrapiPublicUrl)) {
  throw new Error(
    `STRAPI_PUBLIC_URL is not a valid URL ("${rawStrapiPublicUrl}"). On Railway, generate the cms public domain, then rebuild web.`,
  );
}
const strapiPublicUrl = new URL(rawStrapiPublicUrl);

/**
 * Optional cloud storage for uploads (e.g. https://res.cloudinary.com/<cloud-name>), used where
 * the CMS host has no persistent disk. Its path is kept, so only this account's files are allowed.
 */
const rawMediaPublicUrl = process.env.MEDIA_PUBLIC_URL;
if (rawMediaPublicUrl && !URL.canParse(rawMediaPublicUrl)) {
  throw new Error(`MEDIA_PUBLIC_URL is not a valid URL ("${rawMediaPublicUrl}").`);
}
const mediaPublicUrl = rawMediaPublicUrl ? new URL(rawMediaPublicUrl) : undefined;

const securityHeaders = [
  // R3: never index this rebuild, even if HTML metadata were changed.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // Cache Components (the 16.x default) is off on purpose: it prerenders a static shell at
  // build time, and our build cannot reach Strapi. We use tagged fetch caching instead.
  cacheComponents: false,
  poweredByHeader: false,
  images: {
    // Product imagery is served at 80; Next 16 only allows qualities listed here.
    qualities: [75, 80],
    // Next 16 refuses to optimise images from private IPs (SSRF guard). Only a local CMS needs
    // the exception; with a public CMS domain (production) the guard stays on.
    dangerouslyAllowLocalIP: ['localhost', '127.0.0.1'].includes(strapiPublicUrl.hostname),
    remotePatterns: [
      {
        protocol: strapiPublicUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapiPublicUrl.hostname,
        port: strapiPublicUrl.port,
        pathname: '/uploads/**',
      },
      ...(mediaPublicUrl
        ? [
            {
              protocol: 'https' as const,
              hostname: mediaPublicUrl.hostname,
              pathname: `${mediaPublicUrl.pathname.replace(/\/$/, '')}/**`,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
