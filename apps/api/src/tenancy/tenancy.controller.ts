import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { resolveTenantQuerySchema } from '@ojara/shared';
import { SkipThrottle } from '@nestjs/throttler';
import { InternalTokenGuard } from '../auth/guards/internal-token.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { TenancyService } from './tenancy.service.js';

/** Server-to-server routes for the web app's proxy. Not for browsers. */
@ApiTags('internal')
@ApiHeader({ name: 'x-internal-token', required: true })
@Public()
@SkipThrottle()
@UseGuards(InternalTokenGuard)
@Controller('internal/tenants')
export class TenancyController {
  constructor(private readonly tenancy: TenancyService) {}

  @Get('resolve')
  resolve(@Query({ schema: resolveTenantQuerySchema }) query: { host: string }) {
    return this.tenancy.resolveHost(query.host);
  }
}
