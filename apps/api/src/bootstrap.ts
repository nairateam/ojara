import { StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AUTH_BASE_PATH } from './auth/auth.factory.js';
import { AuthService } from './auth/auth.service.js';
import { AppConfigService } from './config/app-config.service.js';

export const API_PREFIX = 'v1';

/**
 * Applies global HTTP configuration. Shared by main.ts and e2e tests so they behave identically.
 * Must run before `app.init()` / `app.listen()`.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(AppConfigService);
  app.useLogger(app.get(Logger));

  app.use(helmet());
  app.enableCors({
    origin: config.env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Better Auth parses its own bodies, so its handler is mounted on Express *before* Nest's body
  // parsers (which Nest registers during init, after this point).
  const auth = app.get(AuthService).auth;
  app.getHttpAdapter().getInstance().all(`${AUTH_BASE_PATH}/*splat`, toNodeHandler(auth));

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();

  if (!config.isProduction) {
    const doc = new DocumentBuilder()
      .setTitle('Ojara API')
      .setDescription(
        `Multi-tenant storefront API. Auth endpoints (Better Auth) live under ${AUTH_BASE_PATH}/* and are not listed here.`,
      )
      .setVersion('0.1.0')
      .addCookieAuth('ojara.session_token')
      .build();
    SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, doc));
  }
}
