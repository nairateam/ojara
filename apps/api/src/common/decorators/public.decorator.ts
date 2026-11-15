import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'ojara:isPublic';

/** Skips the global session guard. Use for webhooks, health, public config and internal routes. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
