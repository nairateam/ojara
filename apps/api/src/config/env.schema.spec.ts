import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.schema.js';

const valid = {
  NODE_ENV: 'development',
  DASHBOARD_URL: 'http://app.ojara.localhost:3000',
  API_PUBLIC_URL: 'http://api.ojara.localhost:4000',
  INTERNAL_API_TOKEN: 'x'.repeat(24),
  DATABASE_URL: 'postgresql://ojara_app:pw@localhost:5432/ojara',
  REDIS_URL: 'redis://localhost:6379',
  BETTER_AUTH_SECRET: 's'.repeat(40),
  EMAIL_FROM: 'Ojara <hello@ojara.localhost>',
  CORS_ORIGINS: 'http://a.test, http://b.test',
  RESEND_API_KEY: '',
};

describe('loadEnv', () => {
  it('parses and normalises a valid environment', () => {
    const env = loadEnv(valid);
    expect(env.PORT).toBe(4000);
    expect(env.ROOT_DOMAIN).toBe('ojara.localhost');
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it('fails fast listing every invalid variable', () => {
    expect(() => loadEnv({ ...valid, DATABASE_URL: 'nope', BETTER_AUTH_SECRET: 'short' })).toThrow(
      /DATABASE_URL[\s\S]*BETTER_AUTH_SECRET/,
    );
  });

  it('requires provider secrets in production', () => {
    expect(() => loadEnv({ ...valid, NODE_ENV: 'production' })).toThrow(/RESEND_API_KEY/);
  });
});
