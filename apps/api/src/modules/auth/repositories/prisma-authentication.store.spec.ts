import { PrismaPg } from '@prisma/adapter-pg';
import { AuthenticationStorage } from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { PrismaClient } from '@restaurant-platform/database';
import { afterAll, describe, it } from 'vitest';
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
