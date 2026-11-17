import type { Lines as LinesValue } from '@/lib/content/types';

type LinesProps = {
  lines: LinesValue;
  /** "always": every line is its own block at all sizes. "desktop": lines flow together below 992px. */
  breaks?: 'always' | 'desktop';
};

/** Renders a CMS heading's lines; a newline in Strapi is the line break. */
export function Lines({ lines, breaks = 'desktop' }: LinesProps) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="line" data-breaks={breaks}>
          {line}
        </span>
      ))}
    </>
  );
}
