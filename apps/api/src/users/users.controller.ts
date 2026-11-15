import { Controller } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';

/** SHELL: User profile & account management (name, avatar, password change). Routes are added with the feature. */
@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
}
