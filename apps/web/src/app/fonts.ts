import { Instrument_Serif, Inter } from 'next/font/google';

/** Both are OFL fonts, downloaded at build time and served from this site (no runtime Google requests). */
export const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-serif',
});
export const sans = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
});
