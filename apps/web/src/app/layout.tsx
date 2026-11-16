import type { Metadata } from 'next';
import './globals.css';

/**
 * noindex is enforced here, in the X-Robots-Tag header (next.config.ts) and in robots.ts.
 * Page-level metadata from the CMS cannot override `robots`, because pages never set it.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
