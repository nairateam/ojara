import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { StoreRole } from '@ojara/shared';
import { STORE_ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { TenantContext } from '../../tenancy/tenant-context.js';
import { assertAdminSessionAllowed } from '../admin-policy.js';
import type { AuthenticatedRequest } from '../auth.types.js';

/**
 * Confirms the signed-in user is a member of the store in `:storeId` (optionally with one of the
 * @StoreRoles), then binds the request's TenantContext to that store. Platform admins may access
 * any store (support use) but only with 2FA and a fresh session; access stays scoped to that store.
 */
@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const storeId = req.params.storeId;
    if (typeof storeId !== 'string' || !storeId)
      throw new ForbiddenException('No store in request');

    const required = this.reflector.getAllAndOverride<StoreRole[] | undefined>(STORE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Membership lookup happens before the tenant is known, so it runs as a system query
    // filtered explicitly by user and store.
    const member = await TenantContext.runAsSystem('store-access-check', () =>
      this.prisma.db.storeMember.findUnique({
        where: { storeId_userId: { storeId, userId: user.id } },
        select: { role: true },
      }),
    );

    const isAdmin = user.role === 'PLATFORM_ADMIN';
    if (!member && !isAdmin) throw new ForbiddenException('You are not a member of this store');
    const roleAllowed = !required?.length || (member !== null && required.includes(member.role));
    if (member && !roleAllowed && !isAdmin) {
      throw new ForbiddenException('Your store role does not allow this action');
    }
    // Admin powers (not a member, or overriding a store role) need 2FA and a fresh session.
    if (isAdmin && (!member || !roleAllowed)) {
      assertAdminSessionAllowed(user, req.session, this.config.env.ADMIN_SESSION_MAX_HOURS);
    }

    req.storeMembership = { storeId, role: member?.role ?? 'OWNER' };
    TenantContext.setStore(storeId, user.id);
    return true;
  }
}
