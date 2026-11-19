/**
 * Railway Infrastructure as Code for the whole project: one file, every resource.
 * Apply with the Railway CLI from the repo root:
 *   railway login && railway link
 *   railway config plan     # review the diff
 *   railway config apply
 * Railway does not read this file during deploys; deploys come from GitHub autodeploy.
 *
 * Secrets are never in this file. They are declared with preserve() ("keep the value
 * already set in Railway") and set once with `railway variables --set` from locally
 * generated random values (see docs/architecture.md). ctx.randomString() is NOT used:
 * it is a sha256 of a public label, so anyone reading this repo could recompute it.
 */
import { defineRailway, github, postgres, preserve, service, volume } from 'railway/iac';

const REPO = 'PavithraGamage/senior-web-developer-surge';

export default defineRailway((ctx, project) => {
  // Postgres is reached only over the private network. Its TCP proxy (public URL) must
  // stay disabled; the database template is checked after apply (see docs/architecture.md).
  const db = postgres('Postgres');

  // Strapi's local upload provider writes to /app/public/uploads. Mounting a volume there
  // makes uploaded media survive redeploys (R7). A volume pins the service to one replica.
  // Region and size match what Railway provisioned, so a plan never proposes shrinking it
  // (decreasing sizeMB is destructive). Same region as the services and Postgres: Singapore,
  // since 20 Nov (it was US West; Strapi queries must not cross regions).
  const uploads = volume('cms-uploads', { region: 'asia-southeast1-eqsg3a', sizeMB: 5000 });

  const cms = service('cms', {
    // checkSuites = Railway's "Wait for CI": a push deploys only after GitHub Actions passes.
    source: github(REPO, { branch: 'main', rootDirectory: 'apps/cms', checkSuites: true }),
    build: {
      builder: 'RAILPACK',
      buildCommand: 'npm run build',
      // Patterns are matched from the repo root, even with a root directory set.
      watchPatterns: ['/apps/cms/**'],
    },
    deploy: {
      startCommand: 'npm run start',
      healthcheckPath: '/_health',
      healthcheckTimeout: 120,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
    },
    volumeMounts: { '/app/public/uploads': uploads },
    // Railway's edge cache, with its defaults: it follows Cache-Control, so only uploads
    // (public, immutable) are cached; the admin and API responses pass through.
    cdn: { enabled: true },
    env: {
      NODE_ENV: 'production',
      // "::" accepts IPv6 (private network) and IPv4. PORT is explicit so `web` can reference it.
      HOST: '::',
      PORT: '1337',
      PUBLIC_URL: 'https://${{RAILWAY_PUBLIC_DOMAIN}}',
      TRUST_PROXY: 'true',
      DATABASE_URL: db.env.DATABASE_URL,
      CORS_ORIGINS: 'https://${{web.RAILWAY_PUBLIC_DOMAIN}}',
      // The webhook travels over the private network, plain http on the service port.
      WEB_REVALIDATE_URL: 'http://${{web.RAILWAY_PRIVATE_DOMAIN}}:${{web.PORT}}/api/revalidate',
      REVALIDATE_SECRET: ctx.shared.REVALIDATE_SECRET,
      APP_KEYS: preserve(),
      API_TOKEN_SALT: preserve(),
      ADMIN_JWT_SECRET: preserve(),
      TRANSFER_TOKEN_SALT: preserve(),
      JWT_SECRET: preserve(),
      ENCRYPTION_KEY: preserve(),
    },
  });

  const web = service('web', {
    source: github(REPO, { branch: 'main', rootDirectory: 'apps/web', checkSuites: true }),
    build: {
      builder: 'RAILPACK',
      buildCommand: 'npm run build',
      watchPatterns: ['/apps/web/**'],
    },
    deploy: {
      startCommand: 'npm run start',
      healthcheckPath: '/api/health',
      healthcheckTimeout: 60,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
    },
    // Edge cache, following Cache-Control: hashed static files are cached; the page itself is
    // private, no-store (per-request CSP nonce), so a Strapi publish shows on the next refresh.
    cdn: { enabled: true },
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      PORT: '3000',
      STRAPI_INTERNAL_URL: 'http://${{cms.RAILWAY_PRIVATE_DOMAIN}}:${{cms.PORT}}',
      STRAPI_PUBLIC_URL: 'https://${{cms.RAILWAY_PUBLIC_DOMAIN}}',
      SITE_URL: 'https://${{RAILWAY_PUBLIC_DOMAIN}}',
      REVALIDATE_SECRET: ctx.shared.REVALIDATE_SECRET,
      // Created in the Strapi admin after the first CMS deploy (read-only / create-only).
      STRAPI_READ_TOKEN: preserve(),
      STRAPI_FORM_TOKEN: preserve(),
    },
  });

  return project('nota-homepage', { resources: [db, uploads, cms, web] });
});
