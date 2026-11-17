import type { Core } from '@strapi/strapi';

/**
 * The site reads content with an API token and has no end-user accounts, so anonymous visitors
 * need no API access at all. Strapi's users-permissions plugin grants the Public role eight auth
 * actions on install (including register), which would let anyone create accounts. This removes
 * every Public permission on each boot, so the role cannot drift back open.
 */
export async function lockPublicRole(strapi: Core.Strapi): Promise<void> {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;

  const permissions = strapi.db.query('plugin::users-permissions.permission');
  const granted: { id: number; action: string }[] = await permissions.findMany({ where: { role: role.id } });
  if (!granted.length) return;

  await permissions.deleteMany({ where: { id: { $in: granted.map((p) => p.id) } } });
  strapi.log.info(`[public-role] removed ${granted.length} permission(s): ${granted.map((p) => p.action).join(', ')}`);
}
