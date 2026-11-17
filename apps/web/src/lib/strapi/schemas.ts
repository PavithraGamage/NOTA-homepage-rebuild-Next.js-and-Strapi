import { z } from 'zod';

/** Raw Strapi 5 REST shapes. Validated here, then mapped to view models in lib/content. */

export const mediaSchema = z.object({
  url: z.string().min(1),
  // Strapi does not measure SVGs, so dimensions can be null.
  width: z.number().nullable(),
  height: z.number().nullable(),
  mime: z.string(),
  alternativeText: z.string().nullable().optional(),
});
export type RawMedia = z.infer<typeof mediaSchema>;

export const responsiveImageSchema = z.object({
  image: mediaSchema,
  max1439: mediaSchema.nullable(),
  max991: mediaSchema.nullable(),
  max767: mediaSchema.nullable(),
  max479: mediaSchema.nullable(),
  alt: z.string(),
});
export type RawResponsiveImage = z.infer<typeof responsiveImageSchema>;

const videoSchema = z.object({ file: mediaSchema, poster: mediaSchema.nullable(), description: z.string().nullable() });
const seoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogImage: mediaSchema.nullable(),
  canonicalUrl: z.string().nullable(),
});
const productSchema = z.object({
  name: z.string(),
  price: z.union([z.number(), z.string()]).transform(Number),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});
const colorwaySchema = z.object({
  name: z.string(),
  tagline: z.string(),
  textColor: z.string(),
  image: responsiveImageSchema,
});

const sectionBase = { anchorId: z.string().nullable(), isHidden: z.boolean() };

/** One schema per dynamic-zone component, keyed by Strapi's __component name. */
export const sectionSchemas = {
  'sections.hero': z.object({
    ...sectionBase,
    heading: z.string(),
    sequence: mediaSchema.nullable(),
    image: responsiveImageSchema,
  }),
  'sections.specs': z.object({
    ...sectionBase,
    headingMuted: z.string(),
    heading: z.string(),
    penImage: responsiveImageSchema,
    groups: z.array(z.object({ title: z.string(), items: z.array(z.object({ text: z.string() })) })),
  }),
  'sections.audience': z.object({
    ...sectionBase,
    statement: z.string(),
    eyebrow: z.string(),
    intro: z.array(z.object({ text: z.string() })),
    cards: z.array(z.object({ title: z.string(), body: z.string() })),
    video: videoSchema,
  }),
  'sections.smart-paper': z.object({
    ...sectionBase,
    headingMuted: z.string(),
    heading: z.string(),
    steps: z
      .array(z.object({ heading: z.string(), subheading: z.string(), body: z.string(), image: responsiveImageSchema }))
      .min(1),
  }),
  'sections.inside-box': z.object({
    ...sectionBase,
    headingMuted: z.string(),
    heading: z.string(),
    kitTitle: z.string(),
    kitBody: z.string(),
    kitImage: responsiveImageSchema,
    statement: z.string(),
    items: z.array(z.object({ name: z.string(), description: z.string(), image: responsiveImageSchema })),
  }),
  'sections.details': z.object({
    ...sectionBase,
    tiles: z.array(
      z.object({
        label: z.string().nullable(),
        image: responsiveImageSchema.nullable(),
        video: mediaSchema.nullable(),
      }),
    ),
  }),
  'sections.colorways': z.object({
    ...sectionBase,
    headingStart: z.string(),
    headingEnd: z.string(),
    introImage: responsiveImageSchema,
    product: productSchema.extend({ colorways: z.array(colorwaySchema) }).nullable(),
  }),
} as const;

export type SectionComponent = keyof typeof sectionSchemas;
export type RawSection<K extends SectionComponent> = z.infer<(typeof sectionSchemas)[K]>;

/** Sections are validated one by one (see lib/content), so one bad entry cannot break the page. */
export const homepageResponseSchema = z.object({
  data: z.object({
    seo: seoSchema,
    sections: z.array(z.object({ __component: z.string() }).loose()),
  }),
});

export const globalResponseSchema = z.object({
  data: z.object({
    siteName: z.string().min(1),
    logo: mediaSchema,
    brandMark: mediaSchema,
    favicon: mediaSchema.nullable(),
    navigation: z.array(z.object({ label: z.string(), targetAnchor: z.string() })),
    orderCta: z.object({ label: z.string(), product: productSchema.nullable() }),
    mobileMenu: z.object({ image: responsiveImageSchema }),
    preloader: z.object({ enabled: z.boolean() }).nullable(),
    waitlistModal: z.object({
      title: z.string(),
      subtitle: z.string(),
      emailPlaceholder: z.string(),
      submitLabel: z.string(),
      closeLabel: z.string(),
      successTitle: z.string(),
      successMessage: z.string(),
      errorRequired: z.string(),
      errorInvalidEmail: z.string(),
      errorGeneric: z.string(),
    }),
    footer: z.object({
      tagline: z.string(),
      navHeading: z.string(),
      yearLabel: z.string(),
      yearValue: z.string(),
      copyright: z.string(),
      credits: z.array(z.object({ label: z.string(), url: z.string().nullable(), opensTeamPopover: z.boolean() })),
      teamGroups: z.array(z.object({ people: z.array(z.object({ name: z.string() })) })),
      popoverCloseLabel: z.string(),
    }),
    defaultSeo: seoSchema,
  }),
});
export type RawGlobal = z.infer<typeof globalResponseSchema>['data'];
export type RawSeo = z.infer<typeof seoSchema>;
