import { DEFAULT_ROOT_DOMAIN } from '@ojara/shared';
import { z } from 'zod';

/**
 * Environment validation. Imported by next.config.ts, so `next dev` / `next build` fail fast on a
 * bad config. Server values must never be imported into client components.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** API base URL reachable from the Next.js server (proxy + Server Components). */
  API_INTERNAL_URL: z.url().default('http://localhost:4000'),
  /** Must equal the API's INTERNAL_API_TOKEN (sent as x-internal-token). */
  INTERNAL_API_TOKEN: z.string().min(16),
  /** Seconds a resolved tenant is cached in memory by the proxy. */
  TENANT_CACHE_TTL_SECONDS: z.coerce.number().int().min(0).max(3600).default(60),
});

const clientSchema = z.object({
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1).default(DEFAULT_ROOT_DOMAIN),
  /** API base URL used by browsers (must share the cookie domain, e.g. api.ojara.localhost). */
  NEXT_PUBLIC_API_URL: z.url().default('http://api.ojara.localhost:4000'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
});

function format(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
}

// Next inlines NEXT_PUBLIC_* only when referenced literally, so list them explicitly.
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined,
});
if (!clientParsed.success)
  throw new Error(`Invalid public environment:\n${format(clientParsed.error)}`);

export const clientEnv = clientParsed.data;

let serverCache: z.infer<typeof serverSchema> | undefined;

/** Server-only env (lazy so client bundles never evaluate it). */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== 'undefined') throw new Error('serverEnv() called in the browser');
  if (!serverCache) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) throw new Error(`Invalid server environment:\n${format(parsed.error)}`);
    serverCache = parsed.data;
  }
  return serverCache;
}
