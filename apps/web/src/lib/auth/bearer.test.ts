import { describe, expect, it } from 'vitest';
import { isBearerAuthorized } from './bearer';

const secret = 'a'.repeat(48);

describe('isBearerAuthorized', () => {
  it('accepts the exact secret', () => {
    expect(isBearerAuthorized(`Bearer ${secret}`, secret)).toBe(true);
  });

  it.each([
    ['missing header', null],
    ['empty header', ''],
    ['wrong scheme', `Basic ${secret}`],
    ['wrong secret', `Bearer ${'b'.repeat(48)}`],
    ['shorter secret', `Bearer ${secret.slice(1)}`],
    ['longer secret', `Bearer ${secret}x`],
  ])('rejects %s', (_label, header) => {
    expect(isBearerAuthorized(header, secret)).toBe(false);
  });
});
