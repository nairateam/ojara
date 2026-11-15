import { defineConfig } from 'vitest/config';

/** Unit tests: no database, Redis or network. */
export default defineConfig({
  test: {
    root: './',
    include: ['src/**/*.spec.ts'],
    env: { NODE_ENV: 'test' },
  },
});
