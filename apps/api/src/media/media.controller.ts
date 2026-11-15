import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { type MediaSignRequest, mediaSignRequestSchema } from '@ojara/shared';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { MediaService } from './media.service.js';

@ApiTags('media')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /** Signed payload for a direct browser upload to Cloudinary. */
  @Post('sign')
  @HttpCode(200)
  sign(
    @Param('storeId') storeId: string,
    @Body({ schema: mediaSignRequestSchema }) body: MediaSignRequest,
  ) {
    return this.media.signUpload(storeId, body);
  }
}
