import { next } from '@ojara/eslint-config/next';

export default [
  ...next,
  { ignores: ['eslint.config.js', 'next.config.ts', 'vitest.config.ts', 'next-env.d.ts'] },
  {
    // shadcn/ui primitives are generated, then restyled; keep their prop-spreading patterns.
    files: ['src/components/ui/**'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
];
