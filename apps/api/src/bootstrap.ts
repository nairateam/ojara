import { StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AUTH_BASE_PATH, CLIENT_IP_HEADER } from './auth/auth.factory.js';
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

  const express = app.getHttpAdapter().getInstance();

  // Client IP for rate limiting. Express derives req.ip from the socket, honouring X-Forwarded-For
  // only from proxies listed in TRUST_PROXY. We then overwrite CLIENT_IP_HEADER with that value,
  // so a client can never choose its own rate-limit bucket by sending the header itself.
  express.set('trust proxy', config.env.TRUST_PROXY);
  express.use((req: Request, _res: Response, next: NextFunction) => {
    req.headers[CLIENT_IP_HEADER] = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    next();
  });

  // Better Auth parses its own bodies, so its handler is mounted on Express *before* Nest's body
  // parsers (which Nest registers during init, after this point).
  const auth = app.get(AuthService).auth;
  express.all(`${AUTH_BASE_PATH}/*splat`, toNodeHandler(auth));

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
