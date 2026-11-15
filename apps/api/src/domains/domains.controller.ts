import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { DomainsService } from './domains.service.js';

/** SHELL: Custom domain connection and DNS verification. Routes are added with the feature. */
@ApiTags('domains')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/domains')
export class DomainsController {
  constructor(private readonly service: DomainsService) {}
}
