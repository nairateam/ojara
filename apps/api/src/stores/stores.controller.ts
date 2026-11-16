import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  type CreateStoreInput,
  createStoreSchema,
  onboardingProgressSchema,
  slugAvailabilitySchema,
  storeMembershipSchema,
  storeSchema,
  storeSummarySchema,
  type UpdateStoreInput,
  updateStoreSchema,
} from '@ojara/shared';
import { z } from 'zod';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StoreRoles } from '../common/decorators/roles.decorator.js';
import { StoresService } from './stores.service.js';

const slugQuerySchema = z.object({
  slug: z.string().max(100),
  /** The store being renamed, whose own current address counts as available. */
  storeId: z.string().max(64).optional(),
});

@ApiTags('stores')
@ApiCookieAuth()
@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body({ schema: createStoreSchema }) body: CreateStoreInput,
  ) {
    return storeSchema.parse(await this.stores.create(user.id, body));
  }

  @Get()
  async listMine(@CurrentUser() user: AuthUser) {
    return z.array(storeMembershipSchema).parse(await this.stores.listForUser(user.id));
  }

  /** Live check for the onboarding / settings "store web address" field. */
  @Get('slug-availability')
  async slugAvailability(
    @Query({ schema: slugQuerySchema }) query: z.infer<typeof slugQuerySchema>,
  ) {
    return slugAvailabilitySchema.parse(
      await this.stores.slugAvailability(query.slug, query.storeId),
    );
  }

  @Get(':storeId')
  @UseGuards(StoreAccessGuard)
  async get(@Param('storeId') storeId: string) {
    return storeSchema.parse(await this.stores.getCurrent(storeId));
  }

  @Patch(':storeId')
  @UseGuards(StoreAccessGuard)
  @StoreRoles('OWNER', 'MANAGER')
  async update(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: updateStoreSchema }) body: UpdateStoreInput,
  ) {
    return storeSchema.parse(await this.stores.update(storeId, user.id, body));
  }

  /** Dashboard shell data: plan, product usage, open orders. */
  @Get(':storeId/summary')
  @UseGuards(StoreAccessGuard)
  async summary(@Param('storeId') storeId: string) {
    return storeSummarySchema.parse(await this.stores.getSummary(storeId));
  }

  /** Records onboarding progress (furthest step reached). */
  @Post(':storeId/onboarding')
  @HttpCode(200)
  @UseGuards(StoreAccessGuard)
  @StoreRoles('OWNER', 'MANAGER')
  async onboarding(
    @Param('storeId') storeId: string,
    @Body({ schema: onboardingProgressSchema }) body: z.infer<typeof onboardingProgressSchema>,
  ) {
    return storeSchema.parse(await this.stores.recordOnboardingStep(storeId, body.step));
  }

  /** Takes the store live (owner only). */
  @Post(':storeId/publish')
  @HttpCode(200)
  @UseGuards(StoreAccessGuard)
  @StoreRoles('OWNER')
  async publish(@Param('storeId') storeId: string, @CurrentUser() user: AuthUser) {
    return storeSchema.parse(await this.stores.publish(storeId, user.id));
  }
}
