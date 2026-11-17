import { describe, expect, it } from 'vitest';
import { validateEmail, waitlistSourceSchema } from './schema';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toEqual({ ok: false, error: 'required' });
    expect(validateEmail('   ')).toEqual({ ok: false, error: 'required' });
    expect(validateEmail(null)).toEqual({ ok: false, error: 'required' });
  });

  it('rejects malformed addresses', () => {
    for (const value of ['me', 'me@', '@example.com', 'me@example', 'me @example.com']) {
      expect(validateEmail(value)).toEqual({ ok: false, error: 'invalid' });
    }
  });

  it('rejects addresses longer than Strapi accepts', () => {
    expect(validateEmail(`${'a'.repeat(250)}@x.co`)).toEqual({ ok: false, error: 'invalid' });
  });

  it('trims and lower-cases valid addresses', () => {
    expect(validateEmail('  Me@Example.COM ')).toEqual({ ok: true, email: 'me@example.com' });
  });
});

describe('waitlistSourceSchema', () => {
  it('only accepts the known order buttons', () => {
    expect(waitlistSourceSchema.safeParse('header-cta').success).toBe(true);
    expect(waitlistSourceSchema.safeParse('somewhere-else').success).toBe(false);
  });
});
