import { Fragment } from 'react';
import type { Lines as LinesValue } from '@/lib/content/types';

type LinesProps = {
  lines: LinesValue;
  /**
   * "always": every line is its own block at all sizes. "desktop": lines flow together below
   * 992px. "first": below 992px only the first break is kept and the rest flow together.
   */
  breaks?: 'always' | 'desktop' | 'first';
};

/**
 * Renders a CMS heading's lines; a newline in Strapi is the line break. A real space separates
 * the lines, so flowing lines read and copy correctly; between block lines it collapses away.
 */
export function Lines({ lines, breaks = 'desktop' }: LinesProps) {
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && ' '}
          <span className="line" data-breaks={breaks}>
            {line}
          </span>
        </Fragment>
      ))}
    </>
  );
}
