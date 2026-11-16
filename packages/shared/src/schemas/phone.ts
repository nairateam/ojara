import { z } from 'zod';

/**
 * Nigerian mobile number in any common form ("0803 555 0144", "803 555 0144", "+234 803…"),
 * normalised to E.164: "+2348035550144".
 */
export const nigerianPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    let digits = value.replace(/[\s()-]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(digits)) digits = '';
    if (digits.startsWith('234')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (!/^[789]\d{9}$/.test(digits)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a Nigerian mobile number, e.g. 803 555 0144',
      });
      return z.NEVER;
    }
    return `+234${digits}`;
  });
