import {
  EmailVerificationService,
  PasswordHasher,
} from '@nestjs/authentication';
import { ConflictException, Injectable } from '@nestjs/common';
import type {
  PublicUser,
  RegisterInput,
} from '../../users/entities/user.entity.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register({
    name,
    email,
    password,
  }: RegisterInput): Promise<PublicUser> {
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.usersRepository.createUser({
      name,
      email,
      passwordHash,
    });
    await this.emailVerification.send({
      id: user.id,
      email: user.email!,
    });

    return user;
  }

  /** The user, or `null` when the email or the password is wrong. */
  async verify(email: string, password: string): Promise<PublicUser | null> {
    const found = await this.usersRepository.findCredentials(email);
    // With no account (or no password), verify() checks a dummy hash, so the
    // response time does not reveal which emails are registered.
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      return null;
    }
    // The cost settings changed since this hash was stored: upgrade it now,
    // while we have the plaintext.
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.usersRepository.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }

    return found.user;
  }
}
