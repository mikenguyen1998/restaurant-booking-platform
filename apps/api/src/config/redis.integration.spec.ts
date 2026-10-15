import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { createCache, type Cache } from 'cache-manager';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RestaurantsRepository } from '../modules/restaurants/repositories/restaurants.repository.js';
import { AvailabilityService } from '../modules/restaurants/services/availability.service.js';
import { cacheConfig } from './cache.config.js';
import { throttlerConfig } from './throttler.config.js';

const url = process.env.REDIS_URL;
const date = '2099-10-10';
const time = (value: string) => new Date(`1970-01-01T${value}:00Z`);

function repository() {
  return {
    findBookingContext: vi.fn().mockResolvedValue({
      status: 'APPROVED',
      timezone: 'Asia/Ho_Chi_Minh',
      bookingSettings: {
        slotIntervalMinutes: 30,
        bookingDurationMinutes: 120,
        bufferMinutes: 15,
      },
    }),
    findOpeningHour: vi
      .fn()
      .mockResolvedValue({ openTime: time('17:00'), closeTime: time('22:00') }),
    findActiveTables: vi
      .fn()
      .mockResolvedValue([{ id: 'table', capacity: 4, priority: 0 }]),
    findActiveCombinations: vi.fn().mockResolvedValue([]),
    findBusyAllocations: vi.fn().mockResolvedValue([]),
    findClosures: vi.fn().mockResolvedValue([]),
  };
}

describe.skipIf(!url)('real Redis cache and throttler contracts', () => {
  const caches: Cache[] = [];
  const cleanup: (() => Promise<void>)[] = [];
  async function cache() {
    const options = await cacheConfig.useFactory!(
      new ConfigService({ REDIS_URL: url, CACHE_TTL_MS: 60_000 }),
    );
    const instance = createCache(options as Parameters<typeof createCache>[0]);
    caches.push(instance);
    return instance;
  }
  function services(a: Cache, b: Cache) {
    const id = randomUUID();
    const repo = repository();
    const make = (store: Cache) =>
      new AvailabilityService(repo as unknown as RestaurantsRepository, store);
    cleanup.push(async () => {
      for (const version of [0, 1, 2]) {
        await a.del(`availability:${id}:v${version}:${date}:2:17:00`);
      }
      await a.del(`availability-version:${id}`);
    });
    return { id, repo, a: make(a), b: make(b) };
  }
  afterEach(async () => {
    try {
      for (const action of cleanup.splice(0)) await action();
    } finally {
      await Promise.all(caches.splice(0).map((c) => c.disconnect()));
    }
  });

  it('shares cached reads and completed invalidation across API instances', async () => {
    const pair = services(await cache(), await cache());
    const query = { date, partySize: 2, slot: '17:00' };
    expect(
      await pair.a.getRestaurantAvailability(pair.id, query),
    ).toMatchObject({ available: true });
    pair.repo.findClosures.mockResolvedValue([
      {
        startAt: new Date(`${date}T17:00:00+07:00`),
        endAt: new Date(`${date}T20:00:00+07:00`),
      },
    ]);
    expect(
      await pair.b.getRestaurantAvailability(pair.id, query),
    ).toMatchObject({ available: true });
    expect(pair.repo.findBookingContext).toHaveBeenCalledTimes(1);
    await pair.a.invalidateAvailability(pair.id);
    expect(
      await pair.b.getRestaurantAvailability(pair.id, query),
    ).toMatchObject({ available: false });
  });

  it('expires Redis cache entries using millisecond TTLs', async () => {
    const a = await cache();
    const b = await cache();
    const key = `integration:${randomUUID()}`;
    cleanup.push(async () => {
      await a.del(key);
    });
    await a.set(key, 'value', 150);
    expect(await b.get(key)).toBe('value');
    await expect
      .poll(() => b.get(key), { timeout: 3000, interval: 40 })
      .toBeUndefined();
  });

  it('atomically counts and blocks concurrent requests across throttler instances', async () => {
    const options = await Promise.all(
      [0, 1].map(() =>
        throttlerConfig.useFactory!(new ConfigService({ REDIS_URL: url })),
      ),
    );
    const stores = options.map((options) => {
      const storage = 'storage' in options ? options.storage : undefined;
      if (!(storage instanceof ThrottlerStorageRedisService)) {
        throw new Error('Expected the configured Redis throttler adapter.');
      }
      return storage;
    });
    const key = randomUUID();
    try {
      const hits = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          stores[i % 2]!.increment(key, 10_000, 5, 10_000, 'default'),
        ),
      );
      expect(hits.map((h) => h.totalHits).sort((a, b) => a - b)).toEqual(
        Array.from({ length: 12 }, (_, i) => i + 1),
      );
      expect(hits.filter((h) => !h.isBlocked)).toHaveLength(5);
      expect(hits.filter((h) => h.isBlocked)).toHaveLength(7);
    } finally {
      await stores[0]!.redis.del(
        `{${key}:default}:hits`,
        `{${key}:default}:blocked`,
      );
      for (const store of stores) store.onModuleDestroy();
    }
  });
});
