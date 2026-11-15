import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@ojara/shared';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { TenantContextMissingError } from '../../tenancy/tenant-context.js';
import { CrossTenantAccessError } from '../../database/tenant-prisma.extension.js';

/** 401 -> "Unauthorized", 422 -> "Unprocessable Entity". */
function statusTitle(status: number): string {
  const name = HttpStatus[status];
  if (!name) return 'Error';
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Converts every error into the shared `ApiError` shape:
 * { statusCode, error, message, requestId, path, timestamp }.
 * Unknown errors become 500s with a generic message; details go to the log, not the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id?: unknown }>();

    const { status, message, code } = this.describe(exception);
    if (status >= 500) {
      this.logger.error({ err: exception, path: req.url }, 'Unhandled exception');
    }

    const body: ApiError = {
      statusCode: status,
      error: statusTitle(status),
      message,
      ...(code ? { code } : {}),
      requestId: typeof req.id === 'string' ? req.id : undefined,
      path: req.originalUrl ?? req.url,
      timestamp: new Date().toISOString(),
    };
    res.status(status).json(body);
  }

  private describe(exception: unknown): {
    status: number;
    message: string | string[];
    code?: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') return { status, message: response };
      const { message: msg, code } = response as { message?: unknown; code?: unknown };
      const codeField = typeof code === 'string' ? { code } : {};
      if (typeof msg === 'string' || Array.isArray(msg)) {
        return { status, message: msg as string | string[], ...codeField };
      }
      return { status, message: exception.message };
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') return { status: 409, message: 'Resource already exists' };
      if (exception.code === 'P2025') return { status: 404, message: 'Resource not found' };
    }
    if (
      exception instanceof TenantContextMissingError ||
      exception instanceof CrossTenantAccessError
    ) {
      // A programming error, but never leak data: treat as forbidden.
      return { status: 403, message: 'Forbidden' };
    }
    return { status: 500, message: 'Internal server error' };
  }
}
