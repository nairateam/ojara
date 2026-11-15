import { Injectable } from '@nestjs/common';
import { type Env, loadEnv } from './env.schema.js';

/** Typed, validated configuration. Inject this instead of reading process.env. */
@Injectable()
export class AppConfigService {
  readonly env: Env;

  constructor(env?: Env) {
    this.env = env ?? loadEnv();
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === 'test';
  }

  /** Public config that is safe to expose to browsers. */
  publicConfig() {
    return {
      rootDomain: this.env.ROOT_DOMAIN,
      paystackPublicKey: this.env.PAYSTACK_PUBLIC_KEY ?? null,
      cloudinaryCloudName: this.env.CLOUDINARY_CLOUD_NAME ?? null,
      /** Whether "Continue with Google" should be offered. */
      googleSignIn: Boolean(this.env.GOOGLE_CLIENT_ID && this.env.GOOGLE_CLIENT_SECRET),
    };
  }
}
