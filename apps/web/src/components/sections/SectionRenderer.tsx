import type { Section } from '@/lib/content/types';
import { Audience } from './Audience';
import { Colorways } from './Colorways';
import { Details } from './Details';
import { Hero } from './Hero';
import { InsideBox } from './InsideBox';
import { SmartPaper } from './SmartPaper';
import { Specs } from './Specs';

/**
 * Section registry: one component per dynamic-zone type. The switch is exhaustive, so adding a
 * section type to the content model without a component fails the type check. Unknown or
 * invalid entries never reach this point (they are skipped and logged in lib/content/mappers).
 */
export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <Hero section={section} />;
    case 'specs':
      return <Specs section={section} />;
    case 'audience':
      return <Audience section={section} />;
    case 'smart-paper':
      return <SmartPaper section={section} />;
    case 'inside-box':
      return <InsideBox section={section} />;
    case 'details':
      return <Details section={section} />;
    case 'colorways':
      return <Colorways section={section} />;
    default: {
      const unhandled: never = section;
      throw new Error(`No component for section ${JSON.stringify(unhandled)}`);
    }
  }
}
