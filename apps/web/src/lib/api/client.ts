import { type ApiError, apiErrorSchema } from '@ojara/shared';
import type { z } from 'zod';

/**
 * Thin typed fetch wrapper. Response bodies are validated with the same Zod schemas the API uses
 * (from @ojara/shared), so the types are shared at compile time and checked at runtime.
 * (Chosen over OpenAPI code generation; see docs/DECISIONS.md.)
 */
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body ? (Array.isArray(body.message) ? body.message.join(', ') : body.message) : `API request failed (${status})`);
    this.name = 'ApiRequestError';
  }
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
  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(json);
    throw new ApiRequestError(res.status, parsed.success ? parsed.data : null);
  }
  return req.schema.parse(json);
}
