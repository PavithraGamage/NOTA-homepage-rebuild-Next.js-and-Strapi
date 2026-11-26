import type { Metadata } from 'next';
import { getHomepage, getSiteChrome } from '@/lib/content/load';
import { getServerEnv } from '@/lib/env';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { PortfolioNotice } from '@/components/site/PortfolioNotice';
import { WaitlistModal } from '@/components/site/WaitlistModal';
import { WaitlistProvider } from '@/components/site/WaitlistContext';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { AnchorNavigation } from '@/components/motion/AnchorNavigation';
import { Preloader } from '@/components/motion/Preloader';
import { SmoothScroll } from '@/components/motion/SmoothScroll';

/**
 * Rendered per request, never at build time: Railway build containers cannot reach Strapi on
 * the private network. Unlike `dynamic = 'force-dynamic'`, `revalidate = 0` keeps our tagged
 * `force-cache` fetches in the data cache, so most requests never hit Strapi.
 */
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [chrome, homepage] = await Promise.all([getSiteChrome(), getHomepage()]);
  const seo = { ...chrome.defaultSeo, ...homepage.seo };
  const ogImage = seo.ogImage ?? chrome.defaultSeo.ogImage;
  return {
    metadataBase: new URL(getServerEnv().SITE_URL),
    title: seo.title,
    description: seo.description,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      images: ogImage ? [{ url: ogImage.url }] : undefined,
    },
    icons: chrome.favicon ? { icon: [{ url: chrome.favicon.url, type: chrome.favicon.mime }] } : undefined,
    // `robots` is deliberately not set here: the layout's noindex applies and cannot be overridden.
  };
}

export default async function HomePage() {
  const [chrome, homepage] = await Promise.all([getSiteChrome(), getHomepage()]);

  return (
    <WaitlistProvider>
      <a href="#top" className="skip-link">
        Skip to content
      </a>
      <Preloader />
      <AnchorNavigation />
      <SmoothScroll />
      <Header chrome={chrome} />
      <main id="top" tabIndex={-1}>
        {homepage.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
      <Footer chrome={chrome} />
      <PortfolioNotice />
      <WaitlistModal copy={chrome.waitlist} />
    </WaitlistProvider>
  );
}
