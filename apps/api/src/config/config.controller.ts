import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { AppConfigService } from './app-config.service.js';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly config: AppConfigService) {}

  /** Browser-safe settings (root domain, publishable keys). */
  @Public()
  @Get('public')
  getPublic() {
    return this.config.publicConfig();
  }
}
