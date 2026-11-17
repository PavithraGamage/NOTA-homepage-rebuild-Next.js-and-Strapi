import 'server-only';
import { cache } from 'react';
import { getServerEnv } from '@/lib/env';
import { strapiGet } from '@/lib/strapi/client';
import { GLOBAL_QUERY, HOMEPAGE_QUERY, toQueryString } from '@/lib/strapi/query';
import { globalResponseSchema, homepageResponseSchema } from '@/lib/strapi/schemas';
import { CACHE_TAGS } from '@/lib/strapi/tags';
import { createMappers, mapSections, mapSiteChrome } from './mappers';
import type { Homepage, SiteChrome } from './types';

const mappers = () => createMappers(getServerEnv().STRAPI_PUBLIC_URL);

/** cache() shares one result between generateMetadata and the page within a request. */
export const getSiteChrome = cache(async (): Promise<SiteChrome> => {
  const response = await strapiGet({
    path: 'global',
    query: toQueryString(GLOBAL_QUERY),
    schema: globalResponseSchema,
    tag: CACHE_TAGS.global,
  });
  return mapSiteChrome(response.data, mappers());
});

export const getHomepage = cache(async (): Promise<Homepage> => {
  const response = await strapiGet({
    path: 'homepage',
    query: toQueryString(HOMEPAGE_QUERY),
    schema: homepageResponseSchema,
    tag: CACHE_TAGS.homepage,
  });
  const m = mappers();
  return { seo: m.seo(response.data.seo), sections: mapSections(response.data.sections, m) };
});
