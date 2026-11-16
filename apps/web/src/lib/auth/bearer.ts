import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Checks an `Authorization: Bearer <secret>` header in constant time.
 * Both sides are hashed first so the comparison never leaks the secret's length and
 * `timingSafeEqual` always receives equal-length buffers.
 */
export function isBearerAuthorized(header: string | null, secret: string): boolean {
  if (!header?.startsWith('Bearer ')) return false;
  const provided = createHash('sha256').update(header.slice('Bearer '.length)).digest();
  const expected = createHash('sha256').update(secret).digest();
  return timingSafeEqual(provided, expected);
}
