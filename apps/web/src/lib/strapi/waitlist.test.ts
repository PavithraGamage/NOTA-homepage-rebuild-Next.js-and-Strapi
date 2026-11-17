import { describe, expect, it } from 'vitest';
import { classifySignupResponse } from './waitlist';

const uniqueError = {
  error: {
    status: 400,
    name: 'ValidationError',
    message: 'This attribute must be unique',
    details: { errors: [{ path: ['email'], message: 'This attribute must be unique', name: 'ValidationError' }] },
  },
};

describe('classifySignupResponse', () => {
  it('treats 2xx as created', () => {
    expect(classifySignupResponse(201, {})).toBe('created');
    expect(classifySignupResponse(200, {})).toBe('created');
  });

  it('treats a unique-email violation as a duplicate (shown as success)', () => {
    expect(classifySignupResponse(400, uniqueError)).toBe('duplicate');
  });

  it('treats any other validation error as a failure', () => {
    const invalid = { error: { details: { errors: [{ path: ['email'], message: 'email must be a valid email' }] } } };
    expect(classifySignupResponse(400, invalid)).toBe('failed');
    expect(classifySignupResponse(400, { error: { details: { errors: [] } } })).toBe('failed');
    expect(classifySignupResponse(400, null)).toBe('failed');
  });

  it('treats auth and server errors as failures', () => {
    expect(classifySignupResponse(401, uniqueError)).toBe('failed');
    expect(classifySignupResponse(403, {})).toBe('failed');
    expect(classifySignupResponse(500, {})).toBe('failed');
  });
});
