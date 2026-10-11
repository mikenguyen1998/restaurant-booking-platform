import type { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

const DEFAULT_TTL_MS = 60_000;

/**
 * Global cache backed by Redis only.
 *
 * No in-memory (L1) layer on purpose: each API instance would keep its own copy,
 * so invalidating availability after a booking would not reach the other instances.
 */
export const cacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    stores: [
      createKeyv(config.getOrThrow<string>('REDIS_URL'), {
        namespace: 'rbp', // every key becomes "rbp::<key>"
      }),
    ],
    // cache-manager TTLs are in milliseconds (Redis EX is in seconds).
    ttl: Number(config.get('CACHE_TTL_MS') ?? DEFAULT_TTL_MS),
  }),
};
