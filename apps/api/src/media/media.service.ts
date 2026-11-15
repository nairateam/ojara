import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { type MediaSignRequest, type MediaSignResponse, PLANS } from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import { IMAGE_SERVICE, type ImageService, MediaNotConfiguredError } from './image.service.js';

@Injectable()
export class MediaService {
  constructor(
    @Inject(IMAGE_SERVICE) private readonly images: ImageService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Issues a signed direct-upload payload after enforcing plan limits (file size, images per
   * product). Must run inside the store's tenant context (StoreAccessGuard).
   */
  async signUpload(storeId: string, req: MediaSignRequest): Promise<MediaSignResponse> {
    const store = await this.prisma.db.store.findUnique({
      where: { id: storeId },
      select: { plan: { select: { key: true } } },
    });
    if (!store) throw new NotFoundException('Store not found');
    const limits = PLANS[store.plan.key].limits;

    if (req.fileSize > limits.maxImageBytes) {
      throw new BadRequestException(
        `Images on your plan can be up to ${Math.floor(limits.maxImageBytes / (1024 * 1024))} MB`,
      );
    }

    if (req.kind === 'product') {
      if (!req.productId) throw new BadRequestException('productId is required for product images');
      const product = await this.prisma.db.product.findUnique({
        where: { id: req.productId },
        select: { _count: { select: { images: true } } },
      });
      if (!product) throw new NotFoundException('Product not found');
      if (product._count.images >= limits.maxImagesPerProduct) {
        throw new ForbiddenException(
          `Your plan allows ${limits.maxImagesPerProduct} images per product. Upgrade to add more.`,
        );
      }
    }

    try {
      const sig = this.images.createUploadSignature({ storeId, kind: req.kind });
      return { ...sig, maxFileSize: limits.maxImageBytes };
    } catch (err) {
      if (err instanceof MediaNotConfiguredError)
        throw new ServiceUnavailableException(err.message);
      throw err;
    }
  }
}
