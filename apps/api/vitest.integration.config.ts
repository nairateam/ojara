import { defineConfig } from 'vitest/config';

/**
 * Integration tests: need a migrated Postgres (DATABASE_URL as the non-superuser app role and
 * DATABASE_MIGRATION_URL as the owner). Run with `pnpm test:integration`.
 */
export default defineConfig({
  test: {
    root: './',
    include: ['test/**/*.int-spec.ts'],
    env: { NODE_ENV: 'test' },
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
