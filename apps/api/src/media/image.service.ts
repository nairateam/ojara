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
  /**
   * Looks up an uploaded asset (after confirming it lives in the store's `kind` folder), so
   * callers store the provider's real dimensions rather than what a browser claims. Null if absent.
   */
  getAsset(publicId: string, storeId: string, kind: MediaKind): Promise<AssetInfo | null>;
  /** Delivery URL using one of the fixed named presets plus f_auto,q_auto. */
  buildUrl(publicId: string, preset: ImagePreset): string;
}

export interface AssetInfo {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const IMAGE_SERVICE = Symbol('IMAGE_SERVICE');

export class MediaNotConfiguredError extends Error {
  constructor() {
    super('Image storage is not configured (set CLOUDINARY_* env vars)');
    this.name = 'MediaNotConfiguredError';
  }
}
