import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit within the window, then refuses', () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 10)).toBe(true);
    expect(allow('ip', 20)).toBe(false);
  });

  it('allows again once old requests leave the window', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 999)).toBe(false);
    expect(allow('ip', 1000)).toBe(true);
  });

  it('counts each visitor separately', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(allow('a', 0)).toBe(true);
    expect(allow('b', 0)).toBe(true);
    expect(allow('a', 1)).toBe(false);
  });

  it('forgets idle visitors when it holds too many', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 100, maxKeys: 2 });
    allow('a', 0);
    allow('b', 0);
    allow('c', 500); // a and b are idle now and get pruned
    expect(allow('a', 501)).toBe(true);
  });
});
