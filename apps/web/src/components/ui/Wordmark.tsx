import type { CSSProperties } from 'react';
import type { ImageAsset } from '@/lib/content/types';

type WordmarkProps = { logo: ImageAsset; label: string; className?: string };

/**
 * The CMS logo (SVG) drawn as a CSS mask filled with `currentColor`, so it follows the header's
 * light/dark theme without inlining uploaded SVG markup into the page.
 */
export function Wordmark({ logo, label, className }: WordmarkProps) {
  const style = { '--mask': `url("${logo.url}")`, aspectRatio: `${logo.width} / ${logo.height}` } as CSSProperties;
  return <span role="img" aria-label={label} className={className} style={style} data-wordmark />;
}
