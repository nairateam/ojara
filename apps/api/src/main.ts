import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';
import { AppConfigService } from './config/app-config.service.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // rawBody keeps the unparsed buffer for Paystack webhook signature verification.
    rawBody: true,
    bufferLogs: true,
  });
  configureApp(app);
  const { PORT } = app.get(AppConfigService).env;
  await app.listen(PORT);
}

await bootstrap();
