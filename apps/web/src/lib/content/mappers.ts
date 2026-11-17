import type {
  RawGlobal,
  RawMedia,
  RawResponsiveImage,
  RawSection,
  RawSeo,
  SectionComponent,
} from '@/lib/strapi/schemas';
import { sectionSchemas } from '@/lib/strapi/schemas';
import type { ImageAsset, Lines, ResponsiveImage, Section, Seo, SiteChrome, VideoAsset } from './types';

/** Media URLs from Strapi's local upload provider are relative; browsers need the public origin. */
export const absoluteUrl = (url: string, publicOrigin: string): string =>
  /^https?:\/\//.test(url) ? url : new URL(url, publicOrigin).toString();

/** A newline in a heading marks the desktop line break. */
export const toLines = (text: string): Lines =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

/** "$300" for whole amounts, "$299.50" otherwise. */
export const formatPrice = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

export function createMappers(publicOrigin: string) {
  const image = (media: RawMedia): ImageAsset => ({
    url: absoluteUrl(media.url, publicOrigin),
    // SVGs have no stored dimensions; their intrinsic size is set by CSS where they are used.
    width: media.width ?? 1,
    height: media.height ?? 1,
    mime: media.mime,
  });
  const optionalImage = (media: RawMedia | null | undefined) => (media ? image(media) : undefined);

  const responsive = (raw: RawResponsiveImage): ResponsiveImage => ({
    alt: raw.alt,
    image: image(raw.image),
    max1439: optionalImage(raw.max1439),
    max991: optionalImage(raw.max991),
    max767: optionalImage(raw.max767),
    max479: optionalImage(raw.max479),
  });

  const video = (file: RawMedia, poster: RawMedia | null, description?: string | null): VideoAsset => ({
    url: absoluteUrl(file.url, publicOrigin),
    mime: file.mime,
    poster: optionalImage(poster),
    description: description ?? undefined,
  });

  const seo = (raw: RawSeo): Seo => ({
    title: raw.metaTitle,
    description: raw.metaDescription,
    ogImage: optionalImage(raw.ogImage),
    canonicalUrl: raw.canonicalUrl ?? undefined,
  });

  return { image, responsive, video, seo };
}

type Mappers = ReturnType<typeof createMappers>;

/** Builds a section view model; `id` is stable within the page (anchor or position). */
function mapSection<K extends SectionComponent>(component: K, raw: RawSection<K>, index: number, m: Mappers): Section {
  const base = { id: raw.anchorId ?? `section-${index}`, anchorId: raw.anchorId ?? undefined };
  switch (component) {
    case 'sections.hero': {
      const s = raw as RawSection<'sections.hero'>;
      return {
        ...base,
        type: 'hero',
        heading: toLines(s.heading),
        sequenceUrl: s.sequence ? m.image(s.sequence).url : undefined,
        image: m.responsive(s.image),
      };
    }
    case 'sections.specs': {
      const s = raw as RawSection<'sections.specs'>;
      return {
        ...base,
        type: 'specs',
        headingMuted: s.headingMuted,
        heading: s.heading,
        penImage: m.responsive(s.penImage),
        groups: s.groups.map((g) => ({ title: g.title, items: g.items.map((i) => i.text) })),
      };
    }
    case 'sections.audience': {
      const s = raw as RawSection<'sections.audience'>;
      return {
        ...base,
        type: 'audience',
        statement: s.statement,
        eyebrow: s.eyebrow,
        intro: s.intro.map((p) => p.text),
        cards: s.cards,
        video: m.video(s.video.file, s.video.poster, s.video.description),
      };
    }
    case 'sections.smart-paper': {
      const s = raw as RawSection<'sections.smart-paper'>;
      return {
        ...base,
        type: 'smart-paper',
        headingMuted: s.headingMuted,
        heading: s.heading,
        steps: s.steps.map((step) => ({
          heading: toLines(step.heading),
          subheading: step.subheading,
          body: step.body,
          image: m.responsive(step.image),
        })),
      };
    }
    case 'sections.inside-box': {
      const s = raw as RawSection<'sections.inside-box'>;
      return {
        ...base,
        type: 'inside-box',
        headingMuted: s.headingMuted,
        heading: s.heading,
        kit: { title: s.kitTitle, body: s.kitBody, image: m.responsive(s.kitImage) },
        statement: s.statement,
        items: s.items.map((item) => ({
          name: item.name,
          description: toLines(item.description),
          image: m.responsive(item.image),
        })),
      };
    }
    case 'sections.details': {
      const s = raw as RawSection<'sections.details'>;
      return {
        ...base,
        type: 'details',
        tiles: s.tiles.map((tile) => ({
          label: tile.label ?? undefined,
          image: tile.image ? m.responsive(tile.image) : undefined,
          video: tile.video ? m.video(tile.video, null) : undefined,
        })),
      };
    }
    case 'sections.colorways': {
      const s = raw as RawSection<'sections.colorways'>;
      return {
        ...base,
        type: 'colorways',
        headingStart: s.headingStart,
        headingEnd: s.headingEnd,
        introImage: m.responsive(s.introImage),
        colorways: (s.product?.colorways ?? []).map((c) => ({
          name: c.name,
          tagline: c.tagline,
          textColor: c.textColor,
          image: m.responsive(c.image),
        })),
      };
    }
  }
  throw new Error(`Unhandled section ${component satisfies never}`);
}

const isKnownComponent = (component: string): component is SectionComponent => component in sectionSchemas;

/**
 * Validates and maps each dynamic-zone entry on its own. Hidden sections are dropped; unknown
 * or invalid ones are logged and skipped so one bad entry never takes the page down.
 */
export function mapSections(
  rawSections: { __component: string; [key: string]: unknown }[],
  m: Mappers,
  log: (message: string) => void = console.warn,
): Section[] {
  const sections: Section[] = [];
  rawSections.forEach((entry, index) => {
    if (!isKnownComponent(entry.__component)) {
      log(`[content] skipping unknown section "${entry.__component}"`);
      return;
    }
    const parsed = sectionSchemas[entry.__component].safeParse(entry);
    if (!parsed.success) {
      log(
        `[content] skipping invalid ${entry.__component}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
      );
      return;
    }
    if (parsed.data.isHidden) return;
    sections.push(mapSection(entry.__component, parsed.data, index, m));
  });
  return sections;
}

export function mapSiteChrome(raw: RawGlobal, m: Mappers): SiteChrome {
  const product = raw.orderCta.product;
  return {
    siteName: raw.siteName,
    logo: m.image(raw.logo),
    brandMark: m.image(raw.brandMark),
    favicon: raw.favicon ? m.image(raw.favicon) : undefined,
    navigation: raw.navigation.map((link) => ({ label: link.label, href: `#${link.targetAnchor}` })),
    orderCta: {
      label: raw.orderCta.label,
      productName: product?.name ?? '',
      priceLabel: product ? formatPrice(product.price, product.currency) : '',
    },
    mobileMenuImage: m.responsive(raw.mobileMenu.image),
    preloaderEnabled: raw.preloader?.enabled ?? true,
    waitlist: { ...raw.waitlistModal, subtitle: toLines(raw.waitlistModal.subtitle) },
    footer: {
      tagline: toLines(raw.footer.tagline),
      navHeading: raw.footer.navHeading,
      yearLabel: raw.footer.yearLabel,
      yearValue: raw.footer.yearValue,
      copyright: raw.footer.copyright,
      credits: raw.footer.credits.map((c) => ({
        label: c.label,
        href: c.url ?? undefined,
        opensTeam: c.opensTeamPopover,
      })),
      team: raw.footer.teamGroups.map((g) => g.people.map((p) => p.name)),
      popoverCloseLabel: raw.footer.popoverCloseLabel,
    },
    defaultSeo: m.seo(raw.defaultSeo),
  };
}
