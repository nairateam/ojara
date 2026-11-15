import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  type CreateStoreInput,
  createStoreSchema,
  storeMembershipSchema,
  storeSchema,
} from '@ojara/shared';
import { z } from 'zod';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StoresService } from './stores.service.js';

@ApiTags('stores')
@ApiCookieAuth()
@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body({ schema: createStoreSchema }) body: CreateStoreInput,
  ) {
    return this.stores.create(user.id, body);
  }

  @Get()
  async listMine(@CurrentUser() user: AuthUser) {
    return z.array(storeMembershipSchema).parse(await this.stores.listForUser(user.id));
  }

  @Get(':storeId')
  @UseGuards(StoreAccessGuard)
  async get(@Param('storeId') storeId: string) {
    return storeSchema.parse(await this.stores.getCurrent(storeId));
  }
}
