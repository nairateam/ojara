import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { AppConfigService } from '../../config/app-config.service.js';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

/** Constant-time check of a request's x-internal-token against the configured secret. */
export function hasValidInternalToken(provided: string | undefined, expected: string): boolean {
  const a = Buffer.from(provided ?? '');
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Protects /v1/internal/* routes called server-to-server by the web app (x-internal-token). */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (
      !hasValidInternalToken(req.header(INTERNAL_TOKEN_HEADER), this.config.env.INTERNAL_API_TOKEN)
    ) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
