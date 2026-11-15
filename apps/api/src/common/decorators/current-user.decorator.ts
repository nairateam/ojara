import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from '../../auth/auth.types.js';

/** Injects the signed-in user. Throws 401 if used on a route without a session. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user) throw new UnauthorizedException();
    return req.user;
  },
);
