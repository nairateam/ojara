import { defineConfig } from 'prisma/config';

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
  // Migrations run as the schema owner. The app itself connects as the non-superuser `ojara_app`
  // role (DATABASE_URL) so RLS is enforced. The URL is optional so `prisma generate` (run before
  // lint/typecheck/test) works on a fresh clone with no .env; migrate commands require it.
  ...(process.env.DATABASE_MIGRATION_URL
    ? { datasource: { url: process.env.DATABASE_MIGRATION_URL } }
    : {}),
});
