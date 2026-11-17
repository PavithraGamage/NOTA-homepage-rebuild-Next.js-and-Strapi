import type { Metadata, Viewport } from 'next';
import { sans, serif } from './fonts';
import './globals.css';

/**
 * noindex is enforced here, in the X-Robots-Tag header (next.config.ts) and in robots.ts.
 * Page metadata from the CMS never sets `robots`, so content cannot switch indexing on.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = { themeColor: '#000000', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
