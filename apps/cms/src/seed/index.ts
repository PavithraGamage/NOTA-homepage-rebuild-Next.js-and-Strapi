import path from 'node:path';
import type { Core, UID } from '@strapi/strapi';
import { globalSeed, homepageSeed, productSeed } from './content';
import { ensureMedia } from './media';

export type SeedOptions = {
  /** Replace existing content with the seed. Off by default so editors' changes are never lost. */
  overwrite: boolean;
};

/**
 * Strapi only types document data per content type after `strapi ts:generate-types`; without
 * generated types the data parameter is unusable, so it is cast. Strapi still validates every
 * field (required, maxLength, regex, media types) when the document is written.
 */
type DocumentData = Record<string, unknown>;

/**
 * Creates (or, with overwrite, replaces) a published document. Single types are found with
 * findFirst; collection entries by a filter. `update` cannot publish in one call in Strapi 5,
 * so updates are followed by an explicit publish.
 */
async function upsertPublished(
  strapi: Core.Strapi,
  uid: UID.ContentType,
  data: DocumentData,
  options: SeedOptions,
  filters?: Record<string, string>,
): Promise<string> {
  const documents = strapi.documents(uid);
  const existing = await documents.findFirst(filters ? { filters } : {});

  if (existing && !options.overwrite) {
    strapi.log.info(`[seed] ${uid} exists, kept (use --overwrite to replace)`);
    return existing.documentId;
  }
  if (existing) {
    await documents.update({ documentId: existing.documentId, data: data as never });
    await documents.publish({ documentId: existing.documentId });
    strapi.log.info(`[seed] ${uid} replaced and published`);
    return existing.documentId;
  }
  const created = await documents.create({ data: data as never, status: 'published' });
  strapi.log.info(`[seed] ${uid} created and published`);
  return created.documentId;
}

/** Fails loudly if anonymous visitors could read or write anything through the API. */
async function assertPublicRoleHasNoPermissions(strapi: Core.Strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' }, populate: ['permissions'] });
  const actions = (role?.permissions ?? []).map((p: { action: string }) => p.action);
  if (actions.length) {
    throw new Error(`The Public role has permissions (${actions.join(', ')}). Remove them: the site reads with an API token.`);
  }
  strapi.log.info('[seed] Public role has no permissions');
}

export async function runSeed(strapi: Core.Strapi, options: SeedOptions): Promise<void> {
  await assertPublicRoleHasNoPermissions(strapi);

  const media = await ensureMedia(strapi, path.join(strapi.dirs.app.root, '.seed-cache'));
  const productId = await upsertPublished(strapi, 'api::product.product', productSeed(media), options, { slug: 'nota-one' });
  await upsertPublished(strapi, 'api::global.global', globalSeed(media, productId), options);
  await upsertPublished(strapi, 'api::homepage.homepage', homepageSeed(media, productId), options);

  strapi.log.info('[seed] done');
}
