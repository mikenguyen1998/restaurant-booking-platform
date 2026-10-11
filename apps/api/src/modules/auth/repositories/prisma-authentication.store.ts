import { Injectable } from '@nestjs/common';
import {
  AuthenticationStorage,
  type EmailTokenPurpose,
  type EmailTokenRecord,
  type EmailTokenStore,
  type MfaState,
  type MfaStore,
  type RefreshTokenRecord,
  type RefreshTokenStore,
  type SessionRecord,
  type SessionStore,
  type TotpRecord,
} from '@nestjs/authentication';
import { Prisma } from '@restaurant-platform/database';
import { PrismaService } from '../../../database/prisma.service.js';

/**
 * Keeps sessions, refresh tokens, authenticators (MFA) and email links
 * (verification, password reset) in PostgreSQL through Prisma, following the store contract of @nestjs/authentication
 * (docs.nestjs.com/security/authentication#the-store-contract).
 *
 * Whatever decides that something works only once is one conditional statement
 * (`updateMany` / `delete` with the condition in `where`), never a read then a write,
 * so the guarantees hold with any number of API instances.
 */
@Injectable()
export class PrismaAuthenticationStore
  implements SessionStore, RefreshTokenStore, MfaStore, EmailTokenStore
{
  /** Pending email links kept at most: anyone can create them. */
  protected readonly maxPending: number = 100_000;

  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      sessions: this,
      refreshTokens: this,
      mfa: this,
      emailTokens: this,
    });
  }

  // --- Sessions -------------------------------------------------------------
  // The API itself signs in with JWTs, but the package revokes sessions together
  // with refresh tokens (password reset, sign out everywhere), so it needs the store.

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.prisma.session.findUnique({ where: { id } });
    return row ? toSessionRecord(row) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prisma.session.create({
      data: {
        ...record,
        metadata: record.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    // Keep the table bounded: sessions past their absolute expiry are useless.
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lte: record.createdAt } },
    });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // Conditional update, never an upsert: a session deleted by a sign-out stays
    // deleted, and lastActiveAt only moves forward.
    await this.prisma.session.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    // Whether this call deleted it: of two rotations, or a rotation and a sign-out, one wins.
    const { count } = await this.prisma.session.deleteMany({ where: { id } });
    return count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({ where: { userId } });
    return rows.map(toSessionRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  // --- Refresh tokens -------------------------------------------------------

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const row = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (!row) return undefined;

    const { revoked: _revoked, usedAt, claims, ...token } = row;
    // Optional fields come back absent, never null.
    return {
      ...token,
      ...(usedAt && { usedAt }),
      ...(claims !== null && { claims: claims as Record<string, unknown> }),
    };
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        ...record,
        claims: record.claims as Prisma.InputJsonValue | undefined,
      },
    });
    // Keep the table bounded: families past their absolute lifetime are useless.
    await this.prisma.refreshToken.deleteMany({
      where: { familyExpiresAt: { lte: record.createdAt } },
    });
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    // Conditional: of two refreshes with the same token, exactly one updates the row.
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: at },
    });
    return count === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    });
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    // A family is revoked when any of its tokens is, which covers a successor saved later.
    const revoked = await this.prisma.refreshToken.findFirst({
      where: { familyId, revoked: true },
      select: { id: true },
    });
    return revoked !== null;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  // --- Authenticators, recovery codes and failed attempts (MFA) ------------

  async getTotp(userId: string): Promise<TotpRecord | undefined> {
    const row = await this.prisma.mfaAuthenticator.findUnique({
      where: { userId },
    });
    if (!row) return undefined;

    const { secret, confirmed, pendingSecret, lastUsedStep } = row;
    return {
      secret,
      confirmed,
      ...(pendingSecret !== null && { pendingSecret }),
      ...(lastUsedStep !== null && { lastUsedStep }),
    };
  }

  async saveTotp(userId: string, record: TotpRecord | null): Promise<void> {
    if (!record) {
      await this.prisma.mfaAuthenticator.deleteMany({ where: { userId } });
      return;
    }
    // Upsert that never lowers the claimed step (the record may have been read before
    // a claim). Prisma's upsert can't reference the conflicting row, hence raw SQL.
    await this.prisma.$executeRaw`
      INSERT INTO "MfaAuthenticator" ("userId", "secret", "confirmed", "pendingSecret", "lastUsedStep")
      VALUES (${userId}, ${record.secret}, ${record.confirmed}, ${record.pendingSecret ?? null}, ${record.lastUsedStep ?? null})
      ON CONFLICT ("userId") DO UPDATE SET
        "secret" = EXCLUDED."secret",
        "confirmed" = EXCLUDED."confirmed",
        "pendingSecret" = EXCLUDED."pendingSecret",
        "lastUsedStep" = GREATEST("MfaAuthenticator"."lastUsedStep", EXCLUDED."lastUsedStep")`;
  }

  async claimTotpStep(userId: string, step: number): Promise<boolean> {
    // Conditional: a code's time step is accepted once.
    const { count } = await this.prisma.mfaAuthenticator.updateMany({
      where: {
        userId,
        OR: [{ lastUsedStep: null }, { lastUsedStep: { lt: step } }],
      },
      data: { lastUsedStep: step },
    });
    return count === 1;
  }

  async saveRecoveryCodes(userId: string, hashes: string[]): Promise<void> {
    // The one method that needs a transaction: a reader never sees half a batch.
    await this.prisma.$transaction([
      this.prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
      this.prisma.mfaRecoveryCode.createMany({
        data: [...new Set(hashes)].map((codeHash) => ({ userId, codeHash })),
      }),
    ]);
  }

  async consumeRecoveryCode(userId: string, hash: string): Promise<boolean> {
    // Conditional: of two requests with the same code, one deletes the row.
    const { count } = await this.prisma.mfaRecoveryCode.deleteMany({
      where: { userId, codeHash: hash },
    });
    return count === 1;
  }

  countRecoveryCodes(userId: string): Promise<number> {
    return this.prisma.mfaRecoveryCode.count({ where: { userId } });
  }

  async recordMfaFailure(
    userId: string,
    windowMs: number,
    now: number,
  ): Promise<number> {
    // Insert, then count, each committed on its own (no transaction): every attempt
    // counts itself and all those recorded before it.
    await this.prisma.mfaFailure.create({
      data: { userId, failedAt: new Date(now) },
    });
    const failures = await this.countMfaFailures(userId, windowMs, now);
    await this.prisma.mfaFailure.deleteMany({
      where: { failedAt: { lte: new Date(now - windowMs) } },
    });
    return failures;
  }

  countMfaFailures(
    userId: string,
    windowMs: number,
    now: number,
  ): Promise<number> {
    return this.prisma.mfaFailure.count({
      where: { userId, failedAt: { gt: new Date(now - windowMs) } },
    });
  }

  async clearMfaFailures(userId: string): Promise<void> {
    await this.prisma.mfaFailure.deleteMany({ where: { userId } });
  }

  // --- Email verification and password reset links -------------------------

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.prisma.emailToken.create({ data: record });
    await this.trimEmailTokens(record.createdAt);
  }

  async consumeEmailToken(
    id: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenRecord | undefined> {
    try {
      // One DELETE ... RETURNING: a link can be used once.
      const row = await this.prisma.emailToken.delete({
        where: { id, purpose },
      });
      const { fingerprint, ...token } = row;
      return {
        ...token,
        purpose: token.purpose as EmailTokenPurpose,
        ...(fingerprint !== null && { fingerprint }),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return undefined; // unknown, already used, or another purpose
      }
      throw error;
    }
  }

  async deleteUserEmailTokens(
    userId: string,
    purpose: EmailTokenPurpose,
  ): Promise<void> {
    await this.prisma.emailToken.deleteMany({ where: { userId, purpose } });
  }

  /** Deletes what expired and, past `maxPending`, what expires first. */
  private async trimEmailTokens(now: Date): Promise<void> {
    await this.prisma.emailToken.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    const cutoff = await this.prisma.emailToken.findFirst({
      orderBy: { expiresAt: 'desc' },
      skip: this.maxPending,
      select: { expiresAt: true },
    });
    if (cutoff) {
      await this.prisma.emailToken.deleteMany({
        where: { expiresAt: { lte: cutoff.expiresAt } },
      });
    }
  }
}

/** A Session row as the package expects it: optional fields absent, never null. */
function toSessionRecord(row: {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  mfa: string | null;
  metadata: Prisma.JsonValue;
}): SessionRecord {
  const { mfa, metadata, ...session } = row;
  return {
    ...session,
    ...(mfa !== null && { mfa: mfa as MfaState }),
    ...(metadata !== null && {
      metadata: metadata as Record<string, unknown>,
    }),
  };
}
