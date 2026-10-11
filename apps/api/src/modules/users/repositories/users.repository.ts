import { Injectable } from '@nestjs/common';
import { normalizeEmail } from '@restaurant-platform/shared';
import { PrismaService } from '../../../database/prisma.service.js';
import type {
  CreateUserData,
  PublicUser,
  UserCredentials,
} from '../entities/user.entity.js';

// Every query below that returns a user omits the hash; only findCredentials reads it.
const WITHOUT_HASH = { passwordHash: true } as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Inserts a user. A duplicate email raises Prisma P2002 (mapped to 409 by the global filter). */
  createUser(data: CreateUserData): Promise<PublicUser> {
    return this.prisma.user.create({
      data: { ...data, email: normalizeEmail(data.email) },
      omit: WITHOUT_HASH,
    });
  }

  findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({ where: { id }, omit: WITHOUT_HASH });
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      omit: WITHOUT_HASH,
    });
  }

  /** For password sign-in only. */
  async findCredentials(email: string): Promise<UserCredentials | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!row) return null;

    const { passwordHash, ...user } = row;
    return { user, passwordHash };
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  /** A missing id raises Prisma P2025 (mapped to 404 by the global filter). */
  updateEmail(id: string, email: string): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      // Nobody has proven the new address yet.
      data: { email: normalizeEmail(email), emailVerified: false },
      omit: WITHOUT_HASH,
    });
  }
  async markEmailVerified(id: string, email: string): Promise<boolean> {
    const { count } = await this.prisma.user.updateMany({
      where: { id, email: normalizeEmail(email) },
      data: { emailVerified: true },
    });
    return count === 1;
  }
}
