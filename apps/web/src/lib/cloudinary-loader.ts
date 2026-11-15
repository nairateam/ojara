'use client';

import { IMAGE_PRESETS, presetForWidth } from '@ojara/shared';

/**
 * next/image loader for Cloudinary. `src` is a Cloudinary public_id (the DB never stores URLs).
 * The requested width is snapped to one of the fixed named presets (thumb/card/detail) so we never
 * create arbitrary-width derivatives (each unique transformation costs credits).
 * Absolute URLs and local files (/...) are passed through untouched.
 */
export default function cloudinaryLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith('/') || /^https?:\/\//.test(src)) return src;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return src;
  const preset = IMAGE_PRESETS[presetForWidth(width)];
  return `https://res.cloudinary.com/${cloud}/image/upload/${preset},f_auto,q_auto/${src}`;
}
