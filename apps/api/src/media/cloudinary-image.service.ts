import { ForbiddenException } from '@nestjs/common';
import { ALLOWED_IMAGE_FORMATS, IMAGE_PRESETS, type ImagePreset, type MediaKind } from '@ojara/shared';
import { v2 as cloudinary } from 'cloudinary';
import { type ImageService, MediaNotConfiguredError, type UploadSignature } from './image.service.js';

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

  async delete(publicId: string, storeId: string): Promise<void> {
    const { cloudName, apiKey, apiSecret } = this.credentials();
    const storePrefix = `ojara/${this.config.envName}/${storeId}/`;
    if (!PUBLIC_ID_PATTERN.test(publicId) || publicId.includes('..') || !publicId.startsWith(storePrefix)) {
      throw new ForbiddenException('That image does not belong to this store');
    }
    // The SDK reads admin-API credentials from its global config.
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
  }

  buildUrl(publicId: string, preset: ImagePreset): string {
    const cloudName = this.config.cloudName;
    if (!cloudName) throw new MediaNotConfiguredError();
    return `https://res.cloudinary.com/${cloudName}/image/upload/${IMAGE_PRESETS[preset]},f_auto,q_auto/${publicId}`;
  }
}
