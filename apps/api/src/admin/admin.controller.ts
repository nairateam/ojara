import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AdminService } from './admin.service.js';

/** SHELL: Platform admin console (merchants, plans, abuse reports, audit log). Routes are added with the feature. */
@ApiTags('admin')
@ApiCookieAuth()
@Roles('PLATFORM_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}
}
