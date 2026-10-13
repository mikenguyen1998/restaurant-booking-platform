import { describe, expect, it } from 'vitest';
import { AuthThrottlerGuard } from './auth-throttler.guard.js';

// getTracker() needs no injected dependency: call it on a bare instance.
const guard = Object.create(AuthThrottlerGuard.prototype) as AuthThrottlerGuard;
const track = (req: Record<string, unknown>) =>
  (
    guard as unknown as {
      getTracker(r: Record<string, unknown>): Promise<string>;
    }
  ).getTracker(req);

describe('AuthThrottlerGuard', () => {
  it('tracks by IP when the body names no account', async () => {
    await expect(track({ ip: '1.2.3.4', ips: [] })).resolves.toBe('1.2.3.4');
  });

  it('tracks by email and IP when the body has an email', async () => {
    await expect(
      track({ ip: '1.2.3.4', ips: [], body: { email: 'an@example.com' } }),
    ).resolves.toBe('an@example.com|1.2.3.4');
  });

  it('normalises the email, so case and spaces do not reset the count', async () => {
    await expect(
      track({ ip: '1.2.3.4', ips: [], body: { email: '  AN@Example.com ' } }),
    ).resolves.toBe('an@example.com|1.2.3.4');
  });

  it('counts the same email from another IP separately', async () => {
    const a = await track({
      ip: '1.1.1.1',
      ips: [],
      body: { email: 'an@example.com' },
    });
    const b = await track({
      ip: '2.2.2.2',
      ips: [],
      body: { email: 'an@example.com' },
    });

    expect(a).not.toBe(b);
  });

  it('ignores a non-string email (falls back to IP)', async () => {
    await expect(
      track({ ip: '1.2.3.4', ips: [], body: { email: ['x@example.com'] } }),
    ).resolves.toBe('1.2.3.4');
  });
});
