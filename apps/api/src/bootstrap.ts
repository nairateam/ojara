import { StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AUTH_BASE_PATH, CLIENT_IP_HEADER } from './auth/auth.factory.js';
import { AuthService } from './auth/auth.service.js';
import {
  hasValidInternalToken,
  INTERNAL_TOKEN_HEADER,
} from './auth/guards/internal-token.guard.js';
import { AppConfigService } from './config/app-config.service.js';

export const API_PREFIX = 'v1';

/** Browser IP relayed by the web app's server; trusted only with a valid internal token. */
export const FORWARDED_CLIENT_IP_HEADER = 'x-ojara-forwarded-for';

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
  // Exception: the web app's server (Server Components) calls on behalf of a browser and passes
  // that browser's IP in FORWARDED_CLIENT_IP_HEADER; it is honoured only alongside the internal
  // token, otherwise every SSR request would share the web server's bucket.
  express.set('trust proxy', config.env.TRUST_PROXY);
  express.use((req: Request, _res: Response, next: NextFunction) => {
    const forwarded = req.header(FORWARDED_CLIENT_IP_HEADER);
    const trusted =
      forwarded !== undefined &&
      hasValidInternalToken(req.header(INTERNAL_TOKEN_HEADER), config.env.INTERNAL_API_TOKEN);
    req.headers[CLIENT_IP_HEADER] = trusted
      ? forwarded.slice(0, 64)
      : (req.ip ?? req.socket.remoteAddress ?? 'unknown');
    delete req.headers[FORWARDED_CLIENT_IP_HEADER];
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
