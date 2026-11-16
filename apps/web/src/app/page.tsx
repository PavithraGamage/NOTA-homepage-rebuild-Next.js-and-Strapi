import type { Metadata } from 'next';
import { getSiteGlobal } from '@/lib/strapi/global';

/**
 * Rendered per request, never at build time: Railway build containers cannot reach
 * Strapi on the private network. Unlike `dynamic = 'force-dynamic'`, `revalidate = 0`
 * keeps our tagged `force-cache` fetches in the data cache, so most requests never hit Strapi.
 */
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteGlobal();
  return { title: siteName };
}

export default async function HomePage() {
  const { siteName } = await getSiteGlobal();

  return (
    <main>
      <h1>{siteName}</h1>
    </main>
  );
}
