import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { TenantContext } from './tenant-context.js';

/**
 * Opens an empty tenant scope for every request. Guards (StoreAccessGuard) bind it to a store
 * after checking membership; until then, tenant-owned queries are refused.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: NextFunction): void {
    TenantContext.run(() => next());
  }
}
