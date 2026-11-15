import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiSignRequest, destroy } = vi.hoisted(() => ({
  apiSignRequest: vi.fn(() => 'signed-hash'),
  destroy: vi.fn(() => Promise.resolve({ result: 'ok' })),
}));

vi.mock('cloudinary', () => ({
  v2: { utils: { api_sign_request: apiSignRequest }, uploader: { destroy }, config: vi.fn() },
}));

const { CloudinaryImageService } = await import('./cloudinary-image.service.js');
const { MediaNotConfiguredError } = await import('./image.service.js');

const config = {
  cloudName: 'ojara-test',
  apiKey: 'key_123',
  apiSecret: 'secret_456',
  envName: 'test',
};

describe('CloudinaryImageService', () => {
  beforeEach(() => {
    apiSignRequest.mockClear();
    destroy.mockClear();
  });

  it('signs uploads into a server-chosen store folder', () => {
    const service = new CloudinaryImageService(config);
    const sig = service.createUploadSignature({ storeId: 'store_a', kind: 'product' });

    expect(sig.folder).toBe('ojara/test/store_a/product');
    expect(sig.signature).toBe('signed-hash');
    expect(sig.apiKey).toBe('key_123');
    expect(sig.uploadUrl).toBe('https://api.cloudinary.com/v1_1/ojara-test/image/upload');
    expect(apiSignRequest).toHaveBeenCalledWith(
      {
        timestamp: sig.timestamp,
        folder: 'ojara/test/store_a/product',
        allowed_formats: sig.allowedFormats,
      },
      'secret_456',
    );
  });

  it('refuses to delete assets outside the store folder', async () => {
    const service = new CloudinaryImageService(config);
    await expect(service.delete('ojara/test/store_b/product/x', 'store_a')).rejects.toThrow(
      /does not belong/,
    );
    await expect(service.delete('ojara/test/store_a/../store_b/x', 'store_a')).rejects.toThrow();
    expect(destroy).not.toHaveBeenCalled();

    await service.delete('ojara/test/store_a/product/abc', 'store_a');
    expect(destroy).toHaveBeenCalledWith(
      'ojara/test/store_a/product/abc',
      expect.objectContaining({ invalidate: true }),
    );
  });

  it('builds delivery URLs from named presets with f_auto,q_auto', () => {
    const service = new CloudinaryImageService(config);
    expect(service.buildUrl('ojara/test/store_a/product/abc', 'thumb')).toBe(
      'https://res.cloudinary.com/ojara-test/image/upload/c_fill,w_160,h_160,f_auto,q_auto/ojara/test/store_a/product/abc',
    );
  });

  it('throws a typed error when not configured', () => {
    const service = new CloudinaryImageService({ envName: 'test' });
    expect(() => service.createUploadSignature({ storeId: 's', kind: 'logo' })).toThrow(
      MediaNotConfiguredError,
    );
  });
});
