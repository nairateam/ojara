import { createHmac, timingSafeEqual } from 'node:crypto';

/** Paystack signs the raw request body with HMAC-SHA512 using the secret key (x-paystack-signature). */
export function verifyPaystackSignature(rawBody: Buffer, signature: string | undefined, secretKey: string): boolean {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac('sha512', secretKey).update(rawBody).digest();
  const provided = Buffer.from(signature, 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
