import { ForbiddenException } from '@nestjs/common';
import {
  ALLOWED_IMAGE_FORMATS,
  IMAGE_PRESETS,
  type ImagePreset,
  type MediaKind,
} from '@ojara/shared';
import { v2 as cloudinary } from 'cloudinary';
import {
  type AssetInfo,
  type ImageService,
  MediaNotConfiguredError,
  type UploadSignature,
} from './image.service.js';

export interface CloudinaryConfig {
  cloudName?: string | undefined;
  apiKey?: string | undefined;
  apiSecret?: string | undefined;
  /** Environment segment of the folder path, e.g. "development" or "production". */
  envName: string;
}

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_\-/]+$/;

export class CloudinaryImageService implements ImageService {
  constructor(private readonly config: CloudinaryConfig) {}

  private credentials() {
    const { cloudName, apiKey, apiSecret } = this.config;
    if (!cloudName || !apiKey || !apiSecret) throw new MediaNotConfiguredError();
    return { cloudName, apiKey, apiSecret };
  }

  folderFor(storeId: string, kind: MediaKind): string {
    return `ojara/${this.config.envName}/${storeId}/${kind}`;
  }

  createUploadSignature({ storeId, kind }: { storeId: string; kind: MediaKind }): UploadSignature {
    const { cloudName, apiKey, apiSecret } = this.credentials();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = this.folderFor(storeId, kind);
    const allowedFormats = ALLOWED_IMAGE_FORMATS.join(',');
    // Every param the browser will send (except file, api_key, signature) must be signed.
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, allowed_formats: allowedFormats },
      apiSecret,
    );
    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      allowedFormats,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  }

  /** Throws unless `publicId` is a well-formed id inside the store's folder. */
  private assertOwned(publicId: string, storeId: string, kind?: MediaKind) {
    const prefix = kind
      ? `${this.folderFor(storeId, kind)}/`
      : `ojara/${this.config.envName}/${storeId}/`;
    if (
      !PUBLIC_ID_PATTERN.test(publicId) ||
      publicId.includes('..') ||
      !publicId.startsWith(prefix)
    ) {
      throw new ForbiddenException('That image does not belong to this store');
    }
  }

  /** The SDK reads admin-API credentials from its global config. */
  private configure() {
    const { cloudName, apiKey, apiSecret } = this.credentials();
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async delete(publicId: string, storeId: string): Promise<void> {
    this.credentials();
    this.assertOwned(publicId, storeId);
    this.configure();
    await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
  }

  async getAsset(publicId: string, storeId: string, kind: MediaKind): Promise<AssetInfo | null> {
    this.credentials();
    this.assertOwned(publicId, storeId, kind);
    this.configure();
    try {
      const r = (await cloudinary.api.resource(publicId, { resource_type: 'image' })) as {
        public_id: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      };
      return {
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes,
      };
    } catch (err) {
      // The Admin API reports a missing asset as an error with http_code 404.
      const code = (err as { error?: { http_code?: number } }).error?.http_code;
      if (code === 404) return null;
      throw err;
    }
  }

  buildUrl(publicId: string, preset: ImagePreset): string {
    const cloudName = this.config.cloudName;
    if (!cloudName) throw new MediaNotConfiguredError();
    return `https://res.cloudinary.com/${cloudName}/image/upload/${IMAGE_PRESETS[preset]},f_auto,q_auto/${publicId}`;
  }
}
