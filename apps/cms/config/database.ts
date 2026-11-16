import type { Core } from '@strapi/strapi';

/**
 * Splits DATABASE_URL into the explicit fields Strapi's config type expects, and fails at
 * startup with a clear message instead of a vague connection error later.
 */
const parseDatabaseUrl = (raw: string | undefined) => {
  if (!raw) {
    throw new Error('DATABASE_URL is required, e.g. postgres://user:password@host:5432/database');
  }
  const url = new URL(raw);
  return {
    // URL wraps IPv6 literals in brackets; the pg driver wants the bare address.
    host: url.hostname.replace(/^\[|\]$/g, ''),
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
};

/**
 * Postgres only: locally via docker compose, in production via Railway's private network.
 * A single DATABASE_URL keeps the Railway setup to one reference variable
 * (`${{Postgres.DATABASE_URL}}`), which already points at the private hostname.
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database<'postgres'> => ({
  connection: {
    client: 'postgres',
    connection: {
      ...parseDatabaseUrl(env('DATABASE_URL')),
      // Traffic stays on Railway's private network, so SSL stays off unless we ever
      // connect through a public proxy.
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    // min 0 lets idle connections close instead of being killed underneath the pool.
    pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 5) },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});

export default config;
