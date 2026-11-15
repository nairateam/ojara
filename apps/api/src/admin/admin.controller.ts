import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AdminService } from './admin.service.js';

/**
 * Platform admin console API. Every route requires PLATFORM_ADMIN + two-factor + a session younger
 * than ADMIN_SESSION_MAX_HOURS (enforced by RolesGuard). Feature routes (merchants, plans, abuse
 * reports, audit log) are added with those features.
 */
@ApiTags('admin')
@ApiCookieAuth()
@Roles('PLATFORM_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  /** Confirms the caller can use the admin console (used by the admin web app to gate access). */
  @Get('session')
  session(@CurrentUser() user: AuthUser) {
    return { user: { id: user.id, name: user.name, email: user.email } };
  }
}
