import { apiErrorSchema } from '@ojara/shared';
import { z } from 'zod';

/**
 * Thin typed fetch wrapper. Response bodies are validated with the same Zod schemas the API uses
 * (from @ojara/shared), so the types are shared at compile time and checked at runtime.
 * (Chosen over OpenAPI code generation; see docs/DECISIONS.md.)
 */

/** Better Auth's own error body (its endpoints live under /v1/auth/*). */
const betterAuthErrorSchema = z.object({ message: z.string(), code: z.string().optional() });

export interface ApiErrorInfo {
  message: string;
  /** Stable machine-readable reason, e.g. TWO_FACTOR_REQUIRED, PASSWORD_COMPROMISED. */
  code: string | undefined;
}

export class ApiRequestError extends Error {
  readonly code: string | undefined;

  constructor(
    readonly status: number,
    readonly body: ApiErrorInfo | null,
  ) {
    super(body?.message ?? `API request failed (${status})`);
    this.name = 'ApiRequestError';
    this.code = body?.code;
  }
}

function parseError(json: unknown): ApiErrorInfo | null {
  const ojara = apiErrorSchema.safeParse(json);
  if (ojara.success) {
    const { message, code } = ojara.data;
    return { message: Array.isArray(message) ? message.join(', ') : message, code };
  }
  const auth = betterAuthErrorSchema.safeParse(json);
  return auth.success ? { message: auth.data.message, code: auth.data.code } : null;
}

export interface ApiRequest<S extends z.ZodType> {
  baseUrl: string;
  path: `/${string}`;
  schema: S;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Browser calls send the session cookie; server-to-server calls don't need it. */
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export async function apiRequest<S extends z.ZodType>(req: ApiRequest<S>): Promise<z.infer<S>> {
  const res = await fetch(new URL(`/v1${req.path}`, req.baseUrl), {
    method: req.method ?? 'GET',
    headers: {
      accept: 'application/json',
      ...(req.body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...req.headers,
    },
    body: req.body !== undefined ? JSON.stringify(req.body) : null,
    credentials: req.credentials ?? 'omit',
    signal: req.signal ?? null,
    cache: req.cache ?? 'no-store',
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiRequestError(res.status, parseError(json));
  return req.schema.parse(json);
}
