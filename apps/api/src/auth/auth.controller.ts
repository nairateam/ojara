import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from './auth.types.js';

/**
 * Better Auth serves its own endpoints under /v1/auth/* (sign-up/email, sign-in/email,
 * verify-email, sign-out, get-session ...), mounted in main.ts before the body parser.
 * This controller only adds app-specific session helpers.
 */
@ApiTags('auth')
@ApiCookieAuth()
@Controller('session')
export class AuthController {
  @Get()
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
