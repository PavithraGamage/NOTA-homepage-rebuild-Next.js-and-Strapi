/**
 * Creates (or replaces) a custom API token for LOCAL development and writes only the token to
 * stdout, so it can be piped into an env file without showing up on screen:
 *
 *   npm run --silent create-token -- form   create waitlist signups  (web STRAPI_FORM_TOKEN)
 *   npm run --silent create-token -- read   read Global/Homepage/Product (web STRAPI_READ_TOKEN)
 *   npm run --silent create-token -- e2e    find + delete waitlist signups (end-to-end tests only)
 *
 * Production tokens are created by a person in the admin (Settings → API Tokens); this script
 * refuses to run with NODE_ENV=production.
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const SIGNUP = 'api::waitlist-signup.waitlist-signup';
const PRESETS = {
  read: {
    name: 'Website: read content (local)',
    permissions: ['api::global.global.find', 'api::homepage.homepage.find', 'api::product.product.find', 'api::product.product.findOne'],
  },
  form: { name: 'Website: waitlist form (local)', permissions: [`${SIGNUP}.create`] },
  e2e: { name: 'End-to-end tests (local)', permissions: [`${SIGNUP}.find`, `${SIGNUP}.delete`] },
};

async function main() {
  const preset = PRESETS[process.argv[2]];
  if (!preset) throw new Error(`Usage: create-token <${Object.keys(PRESETS).join('|')}>`);
  if (process.env.NODE_ENV === 'production') throw new Error('Create production tokens in the admin, not with this script.');

  const appDir = path.resolve(__dirname, '..');
  const app = await createStrapi(await compileStrapi({ appDir })).load();
  app.log.level = 'error';
  try {
    const tokens = app.service('admin::api-token');
    // Re-running rotates the token: the old one with the same name is revoked.
    const existing = await app.db.query('admin::api-token').findOne({ where: { name: preset.name } });
    if (existing) await tokens.revoke(existing.id);
    const token = await tokens.create({
      name: preset.name,
      description: 'Created by scripts/create-token.js for local development.',
      kind: 'content-api',
      type: 'custom',
      lifespan: null,
      permissions: preset.permissions,
    });
    process.stdout.write(`${token.accessKey}\n`);
  } finally {
    await app.destroy();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
