import type {
  SessionRecord,
  SessionService,
  SignInService,
} from '@nestjs/authentication';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionsController } from './sessions.controller.js';

const session = (
  id: string,
  metadata?: Record<string, unknown>,
): SessionRecord => ({
  id,
  userId: 'user-1',
  createdAt: new Date('2026-10-10T00:00:00Z'),
  expiresAt: new Date('2026-10-24T00:00:00Z'),
  lastActiveAt: new Date('2026-10-11T00:00:00Z'),
  ...(metadata && { metadata }),
});

describe('SessionsController', () => {
  let sessionService: {
    list: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
  };
  let signInService: {
    signOut: ReturnType<typeof vi.fn>;
    signOutEverywhere: ReturnType<typeof vi.fn>;
  };
  let controller: SessionsController;

  beforeEach(() => {
    sessionService = { list: vi.fn(), revoke: vi.fn() };
    signInService = {
      signOut: vi.fn(),
      signOutEverywhere: vi.fn().mockResolvedValue(undefined),
    };
    controller = new SessionsController(
      sessionService as unknown as SessionService,
      signInService as unknown as SignInService,
    );
  });

  it('lists the user’s sessions, flags the current one and exposes only safe fields', async () => {
    sessionService.list.mockResolvedValue([
      session('s-chrome', { userAgent: 'Chrome' }),
      session('s-old'),
    ]);

    const result = await controller.list('user-1', session('s-chrome'));

    expect(sessionService.list).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([
      {
        id: 's-chrome',
        createdAt: new Date('2026-10-10T00:00:00Z'),
        lastActiveAt: new Date('2026-10-11T00:00:00Z'),
        userAgent: 'Chrome',
        current: true,
      },
      {
        id: 's-old',
        createdAt: new Date('2026-10-10T00:00:00Z'),
        lastActiveAt: new Date('2026-10-11T00:00:00Z'),
        userAgent: null,
        current: false,
      },
    ]);
  });

  it('revokes one of the user’s own sessions', async () => {
    sessionService.revoke.mockResolvedValue(true);

    await expect(controller.revoke('user-1', 's-old')).resolves.toBeUndefined();
    expect(sessionService.revoke).toHaveBeenCalledWith('s-old', {
      userId: 'user-1',
    });
  });

  it('answers 404 for a session that is not the user’s (or does not exist)', async () => {
    sessionService.revoke.mockResolvedValue(false);

    await expect(controller.revoke('user-1', 's-other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('signs out this browser', async () => {
    signInService.signOut.mockResolvedValue(true);

    await expect(controller.signOut()).resolves.toBeUndefined();
  });

  it('answers 401 when there is no session cookie to sign out', async () => {
    signInService.signOut.mockResolvedValue(false);

    await expect(controller.signOut()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('signs the user out everywhere', async () => {
    await controller.signOutEverywhere('user-1');

    expect(signInService.signOutEverywhere).toHaveBeenCalledWith('user-1');
  });
});
