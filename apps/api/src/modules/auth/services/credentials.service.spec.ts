import {
  PasswordHasher,
  type EmailVerificationService,
} from '@nestjs/authentication';
import { ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicUser } from '../../users/entities/user.entity.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import { CredentialsService } from './credentials.service.js';

const user: PublicUser = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'an@example.com',
  emailVerified: false,
  phone: null,
  name: 'An',
  role: 'CUSTOMER',
  createdAt: new Date('2026-10-07T00:00:00Z'),
  updatedAt: new Date('2026-10-07T00:00:00Z'),
};

function createRepositoryMock() {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockResolvedValue(user),
    findCredentials: vi.fn().mockResolvedValue(null),
    updatePasswordHash: vi.fn().mockResolvedValue(undefined),
  };
}

describe('CredentialsService', () => {
  // Cheap parameters for tests, as the library recommends.
  const hasher = new PasswordHasher({ logN: 10 });
  let repo: ReturnType<typeof createRepositoryMock>;
  let emailVerification: { send: ReturnType<typeof vi.fn> };
  let service: CredentialsService;

  beforeEach(() => {
    repo = createRepositoryMock();
    emailVerification = {
      send: vi.fn().mockResolvedValue({ expiresAt: new Date() }),
    };
    service = new CredentialsService(
      repo as unknown as UsersRepository,
      hasher,
      emailVerification as unknown as EmailVerificationService,
    );
  });

  describe('register', () => {
    const input = {
      name: 'An',
      email: 'an@example.com',
      password: 'correct-horse-battery',
    };

    it('stores a scrypt hash, never the plain password', async () => {
      await service.register(input);

      const saved = repo.createUser.mock.calls[0]![0];
      expect(saved).toMatchObject({ name: 'An', email: 'an@example.com' });
      expect(saved.passwordHash).not.toContain(input.password);
      expect(saved.passwordHash).toMatch(/^\$scrypt\$/);
      expect(await hasher.verify(input.password, saved.passwordHash)).toBe(
        true,
      );
    });

    it('returns the created user without a password hash', async () => {
      const result = await service.register(input);

      expect(result).toBe(user);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('sends a verification link to the new address', async () => {
      await service.register(input);

      expect(emailVerification.send).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
      });
    });

    it('rejects an email that is already registered', async () => {
      repo.findByEmail.mockResolvedValue(user);

      await expect(service.register(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.createUser).not.toHaveBeenCalled();
      expect(emailVerification.send).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('returns the user for the right password', async () => {
      repo.findCredentials.mockResolvedValue({
        user,
        passwordHash: await hasher.hash('correct-horse-battery'),
      });

      await expect(
        service.verify('an@example.com', 'correct-horse-battery'),
      ).resolves.toBe(user);
    });

    it('returns null for a wrong password', async () => {
      repo.findCredentials.mockResolvedValue({
        user,
        passwordHash: await hasher.hash('correct-horse-battery'),
      });

      await expect(
        service.verify('an@example.com', 'wrong-password'),
      ).resolves.toBeNull();
    });

    it('returns null for an unknown email', async () => {
      await expect(
        service.verify('nobody@example.com', 'whatever-password'),
      ).resolves.toBeNull();
    });

    it('returns null for an account without a password', async () => {
      repo.findCredentials.mockResolvedValue({ user, passwordHash: null });

      await expect(
        service.verify('an@example.com', 'whatever-password'),
      ).resolves.toBeNull();
    });

    it('re-hashes a password stored with weaker parameters', async () => {
      // Stored with logN=10; the service is now configured with logN=11.
      const stronger = new CredentialsService(
        repo as unknown as UsersRepository,
        new PasswordHasher({ logN: 11 }),
        emailVerification as unknown as EmailVerificationService,
      );
      repo.findCredentials.mockResolvedValue({
        user,
        passwordHash: await hasher.hash('correct-horse-battery'),
      });

      await stronger.verify('an@example.com', 'correct-horse-battery');

      expect(repo.updatePasswordHash).toHaveBeenCalledWith(
        user.id,
        expect.stringMatching(/^\$scrypt\$ln=11,/),
      );
    });

    it('keeps a hash that already uses the configured parameters', async () => {
      repo.findCredentials.mockResolvedValue({
        user,
        passwordHash: await hasher.hash('correct-horse-battery'),
      });

      await service.verify('an@example.com', 'correct-horse-battery');

      expect(repo.updatePasswordHash).not.toHaveBeenCalled();
    });
  });
});
