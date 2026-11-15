export const MEDIA_KINDS = ['product', 'logo', 'banner'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

/**
 * The only Cloudinary transformations the app may request. A small, named set limits
 * transformation usage (each unique transformation per asset is billed once).
 */
export const IMAGE_PRESETS = {
  thumb: 'c_fill,w_160,h_160',
  card: 'c_fill,w_480,h_600',
  detail: 'c_limit,w_1200',
  logo: 'c_fit,w_240,h_240',
} as const;
export type ImagePreset = keyof typeof IMAGE_PRESETS;
export const IMAGE_PRESET_NAMES = Object.keys(IMAGE_PRESETS) as ImagePreset[];

/** Picks the smallest preset that covers a requested width (used by the next/image loader). */
export function presetForWidth(width: number): ImagePreset {
  if (width <= 160) return 'thumb';
  if (width <= 480) return 'card';
  return 'detail';
}
