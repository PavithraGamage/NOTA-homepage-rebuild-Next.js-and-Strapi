/**
 * Seeds the homepage content and media into the configured database.
 *
 *   npm run seed                 compile, then create anything missing (existing content is kept)
 *   npm run seed -- --overwrite  replace existing content with the seed (media is always reused)
 *   node scripts/seed.js --no-compile   on a server where dist/ is already built (Railway)
 *
 * Boots Strapi without its HTTP server, so it can run next to the live CMS.
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const args = new Set(process.argv.slice(2));
  const appDir = path.resolve(__dirname, '..');
  const context = args.has('--no-compile') ? { appDir, distDir: path.join(appDir, 'dist') } : await compileStrapi({ appDir });

  const app = await createStrapi(context).load();
  app.log.level = 'info';
  try {
    const { runSeed } = require(path.join(context.distDir, 'src', 'seed'));
    await runSeed(app, { overwrite: args.has('--overwrite') });
    // Publishing fires webhooks and history snapshots asynchronously; let them finish before
    // the database pool closes, otherwise a late query waits out the 60 s acquire timeout.
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } finally {
    await app.destroy();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
