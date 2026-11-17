/**
 * Strapi REST populate queries. Strapi reads nested populate from bracket query strings
 * (populate[sections][on][sections.hero][populate][image]=true); this serialiser builds them
 * from plain objects so the queries stay readable without adding the `qs` dependency.
 */
type QueryValue = string | number | boolean | string[] | QueryObject;
export type QueryObject = { [key: string]: QueryValue };

export function toQueryString(query: QueryObject): string {
  const parts: string[] = [];
  const walk = (value: QueryValue, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => parts.push(`${path}[${index}]=${encodeURIComponent(item)}`));
    } else if (typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}[${key}]` : key);
    } else {
      parts.push(`${path}=${encodeURIComponent(String(value))}`);
    }
  };
  walk(query, '');
  return parts.join('&');
}

/**
 * `*` populates every media field one level down, which is exactly what these components hold.
 * Selecting individual media fields per path made the URL ~24 KB, over Node's 16 KB header
 * limit (HTTP 431); the responses are cached, so the extra fields cost nothing per request.
 */
const MEDIA = true;
const RESPONSIVE_IMAGE: QueryObject = { populate: '*' };
const VIDEO: QueryObject = { populate: '*' };
const SEO: QueryObject = { populate: '*' };

/**
 * Every section component must be listed under `on`: Strapi returns only the dynamic-zone
 * entries whose component is named here.
 */
export const HOMEPAGE_QUERY: QueryObject = {
  populate: {
    seo: SEO,
    sections: {
      on: {
        'sections.hero': { populate: { sequence: MEDIA, image: RESPONSIVE_IMAGE } },
        'sections.specs': { populate: { penImage: RESPONSIVE_IMAGE, groups: { populate: { items: true } } } },
        'sections.audience': { populate: { intro: true, cards: true, video: VIDEO } },
        'sections.smart-paper': { populate: { steps: { populate: { image: RESPONSIVE_IMAGE } } } },
        'sections.inside-box': {
          populate: { kitImage: RESPONSIVE_IMAGE, items: { populate: { image: RESPONSIVE_IMAGE } } },
        },
        'sections.details': { populate: { tiles: { populate: { image: RESPONSIVE_IMAGE, video: MEDIA } } } },
        'sections.colorways': {
          populate: {
            introImage: RESPONSIVE_IMAGE,
            product: { populate: { colorways: { populate: { image: RESPONSIVE_IMAGE } } } },
          },
        },
      },
    },
  },
};

export const GLOBAL_QUERY: QueryObject = {
  populate: {
    logo: MEDIA,
    brandMark: MEDIA,
    favicon: MEDIA,
    navigation: true,
    orderCta: { populate: { product: { fields: ['name', 'price', 'currency'] } } },
    mobileMenu: { populate: { image: RESPONSIVE_IMAGE } },
    preloader: true,
    waitlistModal: true,
    footer: { populate: { credits: true, teamGroups: { populate: { people: true } } } },
    defaultSeo: SEO,
  },
};
