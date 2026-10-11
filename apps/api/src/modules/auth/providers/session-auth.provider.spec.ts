import type {
  AuthenticationRegistry,
  SessionRecord,
} from '@nestjs/authentication';
import { describe, expect, it, vi } from 'vitest';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import { SessionAuth } from './session-auth.provider.js';

const session: SessionRecord = {
  id: 's-1',
  userId: 'user-1',
  createdAt: new Date('2026-10-10T00:00:00Z'),
  expiresAt: new Date('2026-10-24T00:00:00Z'),
  lastActiveAt: new Date('2026-10-11T00:00:00Z'),
};

function create() {
  const users = { findById: vi.fn() };
  const registry = { registerProvider: vi.fn() };
  const provider = new SessionAuth(
    users as unknown as UsersRepository,
    registry as unknown as AuthenticationRegistry,
  );
  // validate() is protected: the guard calls it through the base class.
  const validate = (s: SessionRecord) =>
    (provider as unknown as { validate(s: SessionRecord): unknown }).validate(
      s,
    );
  return { provider, users, registry, validate };
}

describe('SessionAuth', () => {
  it('registers itself in the provider chain', () => {
    const { provider, registry } = create();

    expect(registry.registerProvider).toHaveBeenCalledWith(provider);
  });

  it('loads the session’s user on every request', async () => {
    const { users, validate } = create();
    users.findById.mockResolvedValue({ id: 'user-1' });

    await expect(validate(session)).resolves.toEqual({ id: 'user-1' });
    expect(users.findById).toHaveBeenCalledWith('user-1');
  });

  it('returns null for a deleted user, which ends the session', async () => {
    const { users, validate } = create();
    users.findById.mockResolvedValue(null);

    await expect(validate(session)).resolves.toBeNull();
  });
});
