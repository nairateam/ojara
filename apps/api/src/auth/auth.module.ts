import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EmailModule } from '../email/email.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { InternalTokenGuard } from './guards/internal-token.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { SessionGuard } from './guards/session.guard.js';
import { StoreAccessGuard } from './guards/store-access.guard.js';

@Global()
@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    StoreAccessGuard,
    InternalTokenGuard,
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService, StoreAccessGuard, InternalTokenGuard],
})
export class AuthModule {}
