import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PlatformRole } from '@ojara/shared';
import { ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth.types.js';

/** Global guard enforcing @Roles(...) (global platform roles). Runs after SessionGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<PlatformRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
