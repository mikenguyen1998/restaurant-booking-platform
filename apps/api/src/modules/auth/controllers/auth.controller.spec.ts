import type { SignInService } from '@nestjs/authentication';
import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicUser } from '../../users/entities/user.entity.js';
import type { CredentialsService } from '../services/credentials.service.js';
import { AuthController } from './auth.controller.js';

const user: PublicUser = {
  id: '44444444-4444-4444-4444-444444444444',
  email: 'an@example.com',
  emailVerified: false,
  phone: null,
  name: 'An',
  role: 'CUSTOMER',
  createdAt: new Date('2026-10-11T00:00:00Z'),
  updatedAt: new Date('2026-10-11T00:00:00Z'),
};

describe('AuthController', () => {
  let credentials: {
    register: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
  };
  let signInService: { signIn: ReturnType<typeof vi.fn> };
  let controller: AuthController;

  beforeEach(() => {
    credentials = { register: vi.fn(), verify: vi.fn() };
    signInService = { signIn: vi.fn().mockResolvedValue({}) };
    controller = new AuthController(
      credentials as unknown as CredentialsService,
      signInService as unknown as SignInService,
    );
  });

  describe('signUp', () => {
    const body = {
      name: 'An',
      email: 'an@example.com',
      password: 'correct-horse-battery',
    };

    it('creates the account, signs it in and returns the user', async () => {
      credentials.register.mockResolvedValue(user);

      await expect(controller.signUp(body)).resolves.toBe(user);
      expect(credentials.register).toHaveBeenCalledWith(body);
      expect(signInService.signIn).toHaveBeenCalledWith(user.id, {
        method: 'password',
      });
    });

    it('does not sign in when registration fails', async () => {
      credentials.register.mockRejectedValue(new Error('conflict'));

      await expect(controller.signUp(body)).rejects.toThrow('conflict');
      expect(signInService.signIn).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    const body = { email: 'an@example.com', password: 'correct-horse-battery' };

    it('starts a session for the right password', async () => {
      credentials.verify.mockResolvedValue(user);

      await expect(controller.signIn(body)).resolves.toBe(user);
      expect(credentials.verify).toHaveBeenCalledWith(
        'an@example.com',
        'correct-horse-battery',
      );
      expect(signInService.signIn).toHaveBeenCalledWith(user.id, {
        method: 'password',
      });
    });

    it('answers 401 without a session for a wrong email or password', async () => {
      credentials.verify.mockResolvedValue(null);

      await expect(controller.signIn(body)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(signInService.signIn).not.toHaveBeenCalled();
    });
  });
});
