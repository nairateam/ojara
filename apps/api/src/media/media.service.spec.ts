import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PLANS } from '@ojara/shared';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { type ImageService, MediaNotConfiguredError } from './image.service.js';
import { MediaService } from './media.service.js';

function setup(opts: { imageCount?: number; configured?: boolean } = {}) {
  const images: ImageService = {
    createUploadSignature: vi.fn(({ storeId, kind }) => {
      if (opts.configured === false) throw new MediaNotConfiguredError();
      return {
        cloudName: 'c',
        apiKey: 'k',
        timestamp: 1,
        signature: 's',
        folder: `ojara/test/${storeId}/${kind}`,
        allowedFormats: 'jpg',
        uploadUrl: 'https://api.cloudinary.com/v1_1/c/image/upload',
      };
    }),
    delete: vi.fn(),
    buildUrl: vi.fn(),
  };
  const prisma = {
    db: {
      store: { findUnique: vi.fn().mockResolvedValue({ plan: { key: 'FREE' } }) },
      product: {
        findUnique: vi.fn().mockResolvedValue({ _count: { images: opts.imageCount ?? 0 } }),
      },
    },
  } as unknown as PrismaService;
  return new MediaService(images, prisma);
}

const free = PLANS.FREE.limits;

describe('MediaService.signUpload', () => {
  it('signs uploads within plan limits', async () => {
    const res = await setup().signUpload('store_a', {
      kind: 'product',
      productId: 'p1',
      fileSize: 1000,
    });
    expect(res.folder).toBe('ojara/test/store_a/product');
    expect(res.maxFileSize).toBe(free.maxImageBytes);
  });

  it('rejects files over the plan size limit', async () => {
    await expect(
      setup().signUpload('store_a', { kind: 'logo', fileSize: free.maxImageBytes + 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces maxImagesPerProduct', async () => {
    await expect(
      setup({ imageCount: free.maxImagesPerProduct }).signUpload('store_a', {
        kind: 'product',
        productId: 'p1',
        fileSize: 10,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 503 when Cloudinary is not configured', async () => {
    await expect(
      setup({ configured: false }).signUpload('store_a', { kind: 'logo', fileSize: 10 }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
