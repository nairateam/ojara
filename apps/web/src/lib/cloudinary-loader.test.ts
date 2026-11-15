import { afterEach, describe, expect, it, vi } from 'vitest';
import cloudinaryLoader from './cloudinary-loader';

describe('cloudinaryLoader', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('snaps widths to named presets with f_auto,q_auto', () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'ojara-test');
    expect(cloudinaryLoader({ src: 'ojara/production/s1/product/abc', width: 120 })).toBe(
      'https://res.cloudinary.com/ojara-test/image/upload/c_fill,w_160,h_160,f_auto,q_auto/ojara/production/s1/product/abc',
    );
    expect(cloudinaryLoader({ src: 'x', width: 960 })).toContain('/c_limit,w_1200,f_auto,q_auto/x');
  });

  it('passes through local and absolute URLs', () => {
    expect(cloudinaryLoader({ src: '/icon.svg', width: 64 })).toBe('/icon.svg');
    expect(cloudinaryLoader({ src: 'https://example.com/a.png', width: 64 })).toBe(
      'https://example.com/a.png',
    );
  });
});
