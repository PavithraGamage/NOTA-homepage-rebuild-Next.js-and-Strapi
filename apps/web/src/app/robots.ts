import type { MetadataRoute } from 'next';

/**
 * The design belongs to its original creators (brief rule), so crawlers are refused
 * everywhere. Hard-coded on purpose: no CMS field or env var can switch indexing on.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
