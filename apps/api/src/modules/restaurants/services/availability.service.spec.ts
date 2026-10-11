import { BadRequestException, NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cache } from 'cache-manager';
import type { RestaurantsRepository } from '../repositories/restaurants.repository.js';
import { AvailabilityService } from './availability.service.js';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
const SATURDAY = '2026-10-10';

const time = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);
/** Local Saturday time in Asia/Ho_Chi_Minh. */
const sat = (hhmm: string) => new Date(`${SATURDAY}T${hhmm}:00+07:00`);
const allocation = (resourceId: string, from: string, until: string) => ({
  resourceId,
  allocatedFromAt: sat(from),
  allocatedUntilAt: sat(until),
});
const ALL_SLOTS = [
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
];

function createRepositoryMock() {
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
    findOpeningHour: vi.fn().mockResolvedValue({
      openTime: time('17:00'),
      closeTime: time('22:00'),
    }),
    findActiveTables: vi.fn().mockResolvedValue([
      { id: 'table-4', capacity: 4, priority: 0 },
      { id: 'table-6', capacity: 6, priority: 0 },
    ]),
    findActiveCombinations: vi.fn().mockResolvedValue([]),
    findBusyAllocations: vi.fn().mockResolvedValue([]),
    findClosures: vi.fn().mockResolvedValue([]),
  };
}

function createCacheMock() {
  const store = new Map<string, unknown>();
  return {
    store,
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
      return value;
    }),
  };
}

describe('AvailabilityService', () => {
  let repo: ReturnType<typeof createRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let service: AvailabilityService;

  beforeEach(() => {
    // Fixed "now" a few days before the tested Saturday.
    vi.useFakeTimers({ now: new Date('2026-10-06T09:00:00+07:00') });
    repo = createRepositoryMock();
    cache = createCacheMock();
    service = new AvailabilityService(
      repo as unknown as RestaurantsRepository,
      cache as unknown as Cache,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validation', () => {
    it('throws NotFound when the restaurant does not exist', async () => {
      repo.findBookingContext.mockResolvedValue(null);

      await expect(
        service.getRestaurantAvailability(RESTAURANT_ID, {
          date: SATURDAY,
          partySize: 2,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when the restaurant is not APPROVED', async () => {
      repo.findBookingContext.mockResolvedValue({
        status: 'DRAFT',
        timezone: 'Asia/Ho_Chi_Minh',
        bookingSettings: {},
      });

      await expect(
        service.getRestaurantAvailability(RESTAURANT_ID, {
          date: SATURDAY,
          partySize: 2,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when booking settings are missing', async () => {
      repo.findBookingContext.mockResolvedValue({
        status: 'APPROVED',
        timezone: 'Asia/Ho_Chi_Minh',
        bookingSettings: null,
      });

      await expect(
        service.getRestaurantAvailability(RESTAURANT_ID, {
          date: SATURDAY,
          partySize: 2,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a slot that is not generated', async () => {
      await expect(
        service.getRestaurantAvailability(RESTAURANT_ID, {
          date: SATURDAY,
          slot: '19:10',
          partySize: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a slot whose booking would end after closing', async () => {
      await expect(
        service.getRestaurantAvailability(RESTAURANT_ID, {
          date: SATURDAY,
          slot: '20:30',
          partySize: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('slot list (no slot requested)', () => {
    it("looks up opening hours for the date's weekday", async () => {
      await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      expect(repo.findOpeningHour).toHaveBeenCalledWith(
        RESTAURANT_ID,
        'SATURDAY',
      );
    });

    it('returns every generated slot with its availability', async () => {
      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      expect(result).toEqual({
        date: SATURDAY,
        partySize: 2,
        slots: ALL_SLOTS.map((t) => ({ time: t, available: true })),
      });
    });

    it('marks every slot whose occupation overlaps a booking as unavailable', async () => {
      repo.findActiveTables.mockResolvedValue([
        { id: 'table-4', capacity: 4, priority: 0 },
      ]);
      // Existing booking 18:00–20:00 + 15 min buffer → occupied [18:00, 20:15).
      repo.findBusyAllocations.mockResolvedValue([
        allocation('table-4', '18:00', '20:15'),
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      // A slot is busy when [start, start + 135 min) overlaps [18:00, 20:15): 17:00 → 19:15 already does.
      expect(result).toMatchObject({
        slots: [
          { time: '17:00', available: false },
          { time: '17:30', available: false },
          { time: '18:00', available: false },
          { time: '18:30', available: false },
          { time: '19:00', available: false },
          { time: '19:30', available: false },
          { time: '20:00', available: false },
        ],
      });
    });

    it('frees the slot that starts exactly when the occupied window ends (half-open)', async () => {
      repo.findOpeningHour.mockResolvedValue({
        openTime: time('15:45'),
        closeTime: time('23:00'),
      });
      repo.findActiveTables.mockResolvedValue([
        { id: 'table-4', capacity: 4, priority: 0 },
      ]);
      repo.findBookingContext.mockResolvedValue({
        status: 'APPROVED',
        timezone: 'Asia/Ho_Chi_Minh',
        bookingSettings: {
          slotIntervalMinutes: 15,
          bookingDurationMinutes: 120,
          bufferMinutes: 15,
        },
      });
      repo.findBusyAllocations.mockResolvedValue([
        allocation('table-4', '18:00', '20:15'),
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });
      const slots = 'slots' in result ? result.slots : [];
      const availableAt = (t: string) =>
        slots.find((s) => s.time === t)?.available;

      // Domain doc example: latest compatible earlier start 15:45, next free start 20:15.
      expect(availableAt('15:45')).toBe(true);
      expect(availableAt('16:00')).toBe(false);
      expect(availableAt('20:00')).toBe(false);
      expect(availableAt('20:15')).toBe(true);
    });

    it('loads data once for the whole day, not once per slot', async () => {
      await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      expect(repo.findBusyAllocations).toHaveBeenCalledTimes(1);
      // First slot 17:00 → last slot 20:00 + 135 min = 22:15 (+07:00).
      expect(repo.findBusyAllocations).toHaveBeenCalledWith(
        RESTAURANT_ID,
        sat('17:00'),
        sat('22:15'),
      );
    });

    it('omits slots whose meal overlaps a closure', async () => {
      repo.findClosures.mockResolvedValue([
        { startAt: sat('19:00'), endAt: sat('23:59') },
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      // Meal [start, start + 120) must end by 19:00 → only 17:00 survives.
      expect(result).toMatchObject({
        slots: [{ time: '17:00', available: true }],
      });
    });

    it('omits slots that already started (restaurant timezone)', async () => {
      vi.setSystemTime(new Date(`${SATURDAY}T18:10:00+07:00`));

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      expect(result).toMatchObject({
        slots: ['18:30', '19:00', '19:30', '20:00'].map((t) => ({
          time: t,
          available: true,
        })),
      });
    });

    it('returns no slots when the restaurant is closed that day', async () => {
      repo.findOpeningHour.mockResolvedValue(null);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        partySize: 2,
      });

      expect(result).toEqual({ date: SATURDAY, partySize: 2, slots: [] });
    });
  });

  describe('requested slot', () => {
    it('is available when a table with enough capacity is free', async () => {
      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 4,
      });

      expect(result).toEqual({
        date: SATURDAY,
        partySize: 4,
        slot: '19:00',
        available: true,
      });
    });

    it('is available when only some tables are busy', async () => {
      repo.findBusyAllocations.mockResolvedValue([
        allocation('table-4', '18:00', '20:15'),
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 4,
      });

      expect(result).toMatchObject({ available: true });
    });

    it('is unavailable when every suitable table is busy', async () => {
      repo.findBusyAllocations.mockResolvedValue([
        allocation('table-4', '18:00', '20:15'),
        allocation('table-6', '19:30', '21:45'),
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 4,
      });

      expect(result).toMatchObject({ available: false });
    });

    it('is unavailable when no table is big enough', async () => {
      repo.findActiveTables.mockResolvedValue([]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 12,
      });

      expect(result).toMatchObject({ available: false });
    });

    it('is available through a table combination when no single table fits', async () => {
      repo.findActiveTables.mockResolvedValue([
        { id: 'a', capacity: 4, priority: 0 },
        { id: 'b', capacity: 4, priority: 0 },
      ]);
      repo.findActiveCombinations.mockResolvedValue([
        {
          id: 'combo-a+b',
          priority: 0,
          resources: [
            {
              resource: { id: 'a', capacity: 4, priority: 0, status: 'ACTIVE' },
            },
            {
              resource: { id: 'b', capacity: 4, priority: 0, status: 'ACTIVE' },
            },
          ],
        },
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 7,
      });

      expect(result).toMatchObject({ available: true });
    });

    it('is unavailable when one table of the only combination is busy', async () => {
      repo.findActiveTables.mockResolvedValue([
        { id: 'a', capacity: 4, priority: 0 },
        { id: 'b', capacity: 4, priority: 0 },
      ]);
      repo.findActiveCombinations.mockResolvedValue([
        {
          id: 'combo-a+b',
          priority: 0,
          resources: [
            {
              resource: { id: 'a', capacity: 4, priority: 0, status: 'ACTIVE' },
            },
            {
              resource: { id: 'b', capacity: 4, priority: 0, status: 'ACTIVE' },
            },
          ],
        },
      ]);
      repo.findBusyAllocations.mockResolvedValue([
        allocation('b', '18:00', '20:15'),
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 7,
      });

      expect(result).toMatchObject({ available: false });
    });

    it('ignores a combination containing an inactive table', async () => {
      repo.findActiveTables.mockResolvedValue([
        { id: 'a', capacity: 4, priority: 0 },
      ]);
      repo.findActiveCombinations.mockResolvedValue([
        {
          id: 'combo-a+b',
          priority: 0,
          resources: [
            {
              resource: { id: 'a', capacity: 4, priority: 0, status: 'ACTIVE' },
            },
            {
              resource: {
                id: 'b',
                capacity: 4,
                priority: 0,
                status: 'INACTIVE',
              },
            },
          ],
        },
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 7,
      });

      expect(result).toMatchObject({ available: false });
    });

    it('is unavailable inside a closure', async () => {
      repo.findClosures.mockResolvedValue([
        { startAt: sat('20:00'), endAt: sat('23:00') },
      ]);

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 2,
      });

      expect(result).toMatchObject({ available: false });
    });

    it('is unavailable once the slot has started', async () => {
      vi.setSystemTime(new Date(`${SATURDAY}T19:00:00+07:00`));

      const result = await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 2,
      });

      expect(result).toMatchObject({ available: false });
      expect(repo.findBusyAllocations).not.toHaveBeenCalled();
    });

    it('checks conflicts over [start, start + duration + buffer) in the restaurant timezone', async () => {
      await service.getRestaurantAvailability(RESTAURANT_ID, {
        date: SATURDAY,
        slot: '19:00',
        partySize: 4,
      });

      // 19:00 +07:00 = 12:00Z; 19:00 + 120 min + 15 min buffer = 21:15 +07:00 = 14:15Z.
      expect(repo.findBusyAllocations).toHaveBeenCalledWith(
        RESTAURANT_ID,
        new Date('2026-10-10T12:00:00.000Z'),
        new Date('2026-10-10T14:15:00.000Z'),
      );
    });
  });

  describe('caching', () => {
    const query = { date: SATURDAY, slot: '19:00', partySize: 4 };
    const expectedKey = `availability:${RESTAURANT_ID}:v0:${SATURDAY}:4:19:00`;

    it('stores the computed result under a versioned key', async () => {
      const result = await service.getRestaurantAvailability(
        RESTAURANT_ID,
        query,
      );

      expect(cache.set).toHaveBeenCalledWith(expectedKey, result);
    });

    it('returns the cached result without querying the database', async () => {
      const cached = {
        date: SATURDAY,
        partySize: 4,
        slot: '19:00',
        available: false,
      };
      cache.store.set(expectedKey, cached);

      const result = await service.getRestaurantAvailability(
        RESTAURANT_ID,
        query,
      );

      expect(result).toBe(cached);
      expect(repo.findBookingContext).not.toHaveBeenCalled();
      expect(repo.findBusyAllocations).not.toHaveBeenCalled();
    });

    it('hits the database again on the second call only when the version changes', async () => {
      await service.getRestaurantAvailability(RESTAURANT_ID, query);
      await service.getRestaurantAvailability(RESTAURANT_ID, query);
      expect(repo.findBusyAllocations).toHaveBeenCalledTimes(1);

      cache.store.set(`availability-version:${RESTAURANT_ID}`, 1);
      await service.getRestaurantAvailability(RESTAURANT_ID, query);

      expect(repo.findBusyAllocations).toHaveBeenCalledTimes(2);
      expect(cache.set).toHaveBeenLastCalledWith(
        `availability:${RESTAURANT_ID}:v1:${SATURDAY}:4:19:00`,
        expect.objectContaining({ available: true }),
      );
    });

    it('invalidateAvailability makes the next read recompute', async () => {
      const query = { date: SATURDAY, slot: '19:00', partySize: 4 };
      await service.getRestaurantAvailability(RESTAURANT_ID, query);
      await service.invalidateAvailability(RESTAURANT_ID);
      await service.getRestaurantAvailability(RESTAURANT_ID, query);

      expect(repo.findBusyAllocations).toHaveBeenCalledTimes(2); // lần 2 không trúng cache
    });
  });
});
