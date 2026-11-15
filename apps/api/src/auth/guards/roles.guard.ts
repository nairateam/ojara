import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PlatformRole } from '@ojara/shared';
import { ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { assertAdminSessionAllowed } from '../admin-policy.js';
import type { AuthenticatedRequest } from '../auth.types.js';

/**
 * Global guard enforcing @Roles(...) (global platform roles). Runs after SessionGuard.
 * Routes requiring PLATFORM_ADMIN additionally need 2FA and a fresh (≤ ADMIN_SESSION_MAX_HOURS)
 * session.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<PlatformRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const { user, session } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('Insufficient role');
    if (user.role === 'PLATFORM_ADMIN') {
      assertAdminSessionAllowed(user, session, this.config.env.ADMIN_SESSION_MAX_HOURS);
    }
    return true;
  }
}
