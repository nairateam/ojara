import { SetMetadata } from '@nestjs/common';
import type { PlatformRole, StoreRole } from '@ojara/shared';

export const ROLES_KEY = 'ojara:roles';
export const STORE_ROLES_KEY = 'ojara:storeRoles';

/** Requires one of the given global roles (e.g. PLATFORM_ADMIN). Enforced by RolesGuard. */
export const Roles = (...roles: PlatformRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Requires one of the given roles in the store named by `:storeId`. Enforced by StoreAccessGuard;
 * without this decorator any member passes.
 */
export const StoreRoles = (...roles: StoreRole[]) => SetMetadata(STORE_ROLES_KEY, roles);
