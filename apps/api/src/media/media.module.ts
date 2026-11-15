import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { CloudinaryImageService } from './cloudinary-image.service.js';
import { IMAGE_SERVICE } from './image.service.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: IMAGE_SERVICE,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        new CloudinaryImageService({
          cloudName: config.env.CLOUDINARY_CLOUD_NAME,
          apiKey: config.env.CLOUDINARY_API_KEY,
          apiSecret: config.env.CLOUDINARY_API_SECRET,
          envName: config.env.NODE_ENV,
        }),
    },
  ],
  exports: [IMAGE_SERVICE],
})
export class MediaModule {}
