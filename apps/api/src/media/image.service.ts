import type { ImagePreset, MediaKind } from '@ojara/shared';

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  /** Forced server-side to ojara/{env}/{storeId}/{kind}; the client cannot choose it. */
  folder: string;
  allowedFormats: string;
  uploadUrl: string;
}

/**
 * Image storage/CDN abstraction. Everything outside the media module depends on this interface,
 * never on the Cloudinary SDK, so the provider can be swapped.
 */
export interface ImageService {
  createUploadSignature(params: { storeId: string; kind: MediaKind }): UploadSignature;
  /** Deletes an asset after confirming it lives in the store's folder. */
  delete(publicId: string, storeId: string): Promise<void>;
  /** Delivery URL using one of the fixed named presets plus f_auto,q_auto. */
  buildUrl(publicId: string, preset: ImagePreset): string;
}

export const IMAGE_SERVICE = Symbol('IMAGE_SERVICE');

export class MediaNotConfiguredError extends Error {
  constructor() {
    super('Image storage is not configured (set CLOUDINARY_* env vars)');
    this.name = 'MediaNotConfiguredError';
  }
}
