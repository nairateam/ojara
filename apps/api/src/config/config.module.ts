import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service.js';
import { ConfigController } from './config.controller.js';

@Global()
@Module({
  controllers: [ConfigController],
  providers: [{ provide: AppConfigService, useFactory: () => new AppConfigService() }],
  exports: [AppConfigService],
})
export class ConfigModule {}
