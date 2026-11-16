import 'server-only';
import { z } from 'zod';
import { strapiGet } from './client';
import { CACHE_TAGS } from './tags';

/** Raw Strapi 5 REST shape for the Global single type (fields grow in Phase 2). */
export const globalResponseSchema = z.object({
  data: z.object({
    documentId: z.string(),
    siteName: z.string().min(1),
  }),
});

/** The view model components receive: no Strapi envelope, no ids. */
export type SiteGlobal = { siteName: string };

export const toSiteGlobal = (response: z.infer<typeof globalResponseSchema>): SiteGlobal => ({
  siteName: response.data.siteName,
});

export async function getSiteGlobal(): Promise<SiteGlobal> {
  const response = await strapiGet({ path: 'global', schema: globalResponseSchema, tag: CACHE_TAGS.global });
  return toSiteGlobal(response);
}
