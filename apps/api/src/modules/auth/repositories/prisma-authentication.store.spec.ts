import { PrismaPg } from '@prisma/adapter-pg';
import { AuthenticationStorage } from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { PrismaClient } from '@restaurant-platform/database';
import { afterAll, beforeAll, describe, it } from 'vitest';
import type { PrismaService } from '../../../database/prisma.service.js';
import { PrismaAuthenticationStore } from './prisma-authentication.store.js';

// The library's own contract suite, against a real PostgreSQL with a connection pool,
// so the concurrency cases (parallel refreshes, parallel link uses) race for real.
// Needs a migrated, disposable database: the suite truncates the auth tables.
const url = process.env.TEST_DATABASE_URL;

/** The store with a cap of 3 pending links, so the suite can check the cap. */
class CappedStore extends PrismaAuthenticationStore {
  protected override readonly maxPending = 3;
}

describe.skipIf(!url)(
  `PrismaAuthenticationStore contract${url ? '' : ' (skipped: TEST_DATABASE_URL not set)'}`,
  () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: url, max: 10 }),
    }) as unknown as PrismaService;

    afterAll(() => prisma.$disconnect());

    beforeAll(async () => {
      const databaseName = new URL(url!).pathname.slice(1);
      if (!databaseName.endsWith('_test')) {
        throw new Error(
          'TEST_DATABASE_URL must point to a disposable database whose name ends in _test; this suite truncates auth tables.',
        );
      }

      try {
        // Check connectivity and schema once, before any destructive cleanup.
        await prisma.$queryRaw`
          SELECT 1 FROM "Session", "RefreshToken", "EmailToken",
            "MfaAuthenticator", "MfaRecoveryCode", "MfaFailure"
          LIMIT 0
        `;
      } catch (error) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : 'unknown';
        if (code === 'EPERM' || code === 'EACCES') {
          throw new Error(
            `Auth test database connection is blocked by execution permissions (${code}). Run pnpm test in a terminal with localhost access, or approve running it outside the agent sandbox.`,
          );
        }
        throw new Error(
          `Auth test database is unavailable or missing migrations (${code}). Start PostgreSQL with docker compose up -d postgres, then prepare the dedicated TEST_DATABASE_URL database. See apps/api/README.md#tests.`,
        );
      }
    });

    async function emptyStore() {
      await prisma.$executeRawUnsafe(
        'TRUNCATE "Session", "RefreshToken", "EmailToken", "MfaAuthenticator", "MfaRecoveryCode", "MfaFailure"',
      );
      const store = new CappedStore(prisma, new AuthenticationStorage());
      return {
        sessions: store,
        refreshTokens: store,
        mfa: store,
        emailTokens: store,
      };
    }

    for (const c of authenticationStoreContract(emptyStore, {
      // No magic links or OIDC.
      contracts: ['sessions', 'refreshTokens', 'mfa', 'emailTokens'],
      concurrent: true,
      maxPending: 3,
    })) {
      it(c.name, c.run);
    }
  },
);
