/** View models: what components receive. No Strapi envelopes, ids or relative URLs. */

export type ImageAsset = { url: string; width: number; height: number; mime: string };

/** An image with optional art-directed crops; each crop falls back to the next larger one. */
export type ResponsiveImage = {
  alt: string;
  image: ImageAsset;
  max1439?: ImageAsset;
  max991?: ImageAsset;
  max767?: ImageAsset;
  max479?: ImageAsset;
};

export type VideoAsset = { url: string; mime: string; poster?: ImageAsset; description?: string };

/** A heading split on its desktop line breaks. */
export type Lines = string[];

export type NavLink = { label: string; href: string };

export type OrderCta = { label: string; productName: string; priceLabel: string };

export type Seo = { title: string; description: string; ogImage?: ImageAsset; canonicalUrl?: string };

export type WaitlistCopy = {
  title: string;
  subtitle: Lines;
  emailPlaceholder: string;
  submitLabel: string;
  closeLabel: string;
  successTitle: string;
  successMessage: string;
  errorRequired: string;
  errorInvalidEmail: string;
  errorGeneric: string;
};

export type FooterCredit = { label: string; href?: string; opensTeam: boolean };

export type SiteChrome = {
  siteName: string;
  logo: ImageAsset;
  brandMark: ImageAsset;
  favicon?: ImageAsset;
  navigation: NavLink[];
  orderCta: OrderCta;
  mobileMenuImage: ResponsiveImage;
  preloaderEnabled: boolean;
  waitlist: WaitlistCopy;
  footer: {
    tagline: Lines;
    navHeading: string;
    yearLabel: string;
    yearValue: string;
    copyright: string;
    credits: FooterCredit[];
    team: string[][];
    popoverCloseLabel: string;
  };
  defaultSeo: Seo;
};

type SectionBase = { id: string; anchorId?: string };

export type HeroSection = SectionBase & { type: 'hero'; heading: Lines; sequenceUrl?: string; image: ResponsiveImage };
export type SpecsSection = SectionBase & {
  type: 'specs';
  headingMuted: string;
  heading: string;
  penImage: ResponsiveImage;
  groups: { title: string; items: string[] }[];
};
export type AudienceSection = SectionBase & {
  type: 'audience';
  statement: string;
  eyebrow: string;
  intro: string[];
  cards: { title: string; body: string }[];
  video: VideoAsset;
};
export type SmartPaperSection = SectionBase & {
  type: 'smart-paper';
  headingMuted: string;
  heading: string;
  steps: { heading: Lines; subheading: string; body: string; image: ResponsiveImage }[];
};
export type InsideBoxSection = SectionBase & {
  type: 'inside-box';
  headingMuted: string;
  heading: string;
  kit: { title: string; body: string; image: ResponsiveImage };
  statement: string;
  items: { name: string; description: Lines; image: ResponsiveImage }[];
};
export type DetailsSection = SectionBase & {
  type: 'details';
  tiles: { label?: string; image?: ResponsiveImage; video?: VideoAsset }[];
};
export type ColorwaysSection = SectionBase & {
  type: 'colorways';
  headingStart: string;
  headingEnd: string;
  introImage: ResponsiveImage;
  colorways: { name: string; tagline: string; textColor: string; image: ResponsiveImage }[];
};

export type Section =
  | HeroSection
  | SpecsSection
  | AudienceSection
  | SmartPaperSection
  | InsideBoxSection
  | DetailsSection
  | ColorwaysSection;

export type Homepage = { seo: Seo; sections: Section[] };
