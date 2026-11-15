import type { NextConfig } from 'next';
import { serverEnv } from './src/env';

// Fail fast: validate env when `next dev` / `next build` / `next start` load this file.
serverEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Cache Components is off for now; see docs/DECISIONS.md (storefront pages will opt into
  // `'use cache'` once they render real catalogue data).
  // Tailwind CSS v4 via its Turbopack loader (the create-next-app 16.4 default; no PostCSS config).
  turbopack: {
    rules: {
      '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' },
    },
  },
  images: {
    // `src` is a Cloudinary public_id; the loader maps widths to named presets.
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    deviceSizes: [320, 480, 640, 960, 1200],
    imageSizes: [160, 240],
  },
};

export default nextConfig;
