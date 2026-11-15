import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyPaystackSignature } from './paystack-signature.js';

describe('verifyPaystackSignature', () => {
  const secret = 'sk_test_abc';
  const body = Buffer.from(
    JSON.stringify({ event: 'charge.success', data: { id: 1, reference: 'r1' } }),
  );
  const sign = (b: Buffer) => createHmac('sha512', secret).update(b).digest('hex');

  it('accepts a valid HMAC-SHA512 signature over the raw body', () => {
    expect(verifyPaystackSignature(body, sign(body), secret)).toBe(true);
  });

  it('rejects tampered bodies, wrong secrets and missing signatures', () => {
    expect(verifyPaystackSignature(Buffer.from(`${body.toString()} `), sign(body), secret)).toBe(
      false,
    );
    expect(verifyPaystackSignature(body, sign(body), 'sk_test_other')).toBe(false);
    expect(verifyPaystackSignature(body, undefined, secret)).toBe(false);
    expect(verifyPaystackSignature(body, 'not-hex', secret)).toBe(false);
  });
});
