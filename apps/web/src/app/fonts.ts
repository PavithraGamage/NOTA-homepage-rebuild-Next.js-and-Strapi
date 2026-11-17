import { Instrument_Serif, Inter } from 'next/font/google';

/**
 * Both are OFL fonts, downloaded at build time and served from this site (no runtime Google
 * requests). `subsets` is what gets preloaded: Latin only, so first paint isn't competing with
 * four font files. Latin Extended (the Ō in NŌTA) still loads on demand via unicode-range.
 */
export const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});
export const sans = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
