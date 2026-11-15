import { defineConfig, env } from 'prisma/config';

// Load apps/api/.env when present (Node >= 21.7). CI and production inject env vars directly.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env file: rely on the process environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations run as the schema owner. The app itself connects as the non-superuser
    // `ojara_app` role (DATABASE_URL) so RLS is enforced.
    url: env('DATABASE_MIGRATION_URL'),
  },
});
