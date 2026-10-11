import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSlots, intervalsOverlap } from '@restaurant-platform/shared';
import type { Cache } from 'cache-manager';
import { DateTime } from 'luxon';
import {
  formatDbTime,
  getDayOfWeek,
  toZonedDateTime,
} from '../../../common/utils/date.js';
import {
  buildCandidates,
  pickFreeCandidate,
  rankCandidates,
} from '../domain/allocation.js';
import { GetRestaurantAvailabilityDto } from '../dto/availability.dto.js';
import { RestaurantsRepository } from '../repositories/restaurants.repository.js';

export interface SlotAvailability {
  time: string;
  available: boolean;
}

export type AvailabilityResult =
  | { date: string; partySize: number; slots: SlotAvailability[] }
  | { date: string; partySize: number; slot: string; available: boolean };

/** One slot's windows: the meal [startsAt, endsAt) and the table occupation [startsAt, occupiedUntil). */
interface SlotWindow {
  time: string;
  startsAt: Date;
  endsAt: Date;
  occupiedUntil: Date;
}

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly restaurants: RestaurantsRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private versionKey(restaurantId: string) {
    return `availability-version:${restaurantId}`;
  }

  private async getVersion(restaurantId: string): Promise<number> {
    // chưa có version (lần đầu) thì coi như 0
    return (await this.cache.get<number>(this.versionKey(restaurantId))) ?? 0;
  }

  async invalidateAvailability(restaurantId: string): Promise<void> {
    let version = await this.getVersion(restaurantId);
    await this.cache.set(this.versionKey(restaurantId), version + 1, 0);
  }

  async getRestaurantAvailability(
    id: string,
    { date, slot, partySize }: GetRestaurantAvailabilityDto,
  ): Promise<AvailabilityResult> {
    const version = await this.getVersion(id);
    const key = `availability:${id}:v${version}:${date}:${partySize}:${slot ?? 'all'}`;

    const cached = await this.cache.get<AvailabilityResult>(key);
    if (cached) {
      return cached;
    }

    const result = await this.computeAvailability(id, date, partySize, slot);
    await this.cache.set(key, result);
    return result;
  }

  private async computeAvailability(
    id: string,
    date: string,
    partySize: number,
    slot: string | undefined,
  ): Promise<AvailabilityResult> {
    const restaurant = await this.restaurants.findBookingContext(id);
    const settings = restaurant?.bookingSettings;

    if (!restaurant || !settings || restaurant.status !== 'APPROVED') {
      throw new NotFoundException('Restaurant not found');
    }

    const { timezone } = restaurant;
    const openingHour = await this.restaurants.findOpeningHour(
      id,
      getDayOfWeek(date, timezone),
    );
    const times = openingHour
      ? generateSlots(
          formatDbTime(openingHour.openTime),
          formatDbTime(openingHour.closeTime),
          settings.slotIntervalMinutes,
          settings.bookingDurationMinutes,
        )
      : [];

    if (slot && !times.includes(slot)) {
      throw new BadRequestException('Invalid slot');
    }

    // Past slots can never be booked (domain: startsAt <= now is dropped).
    const now = DateTime.now().toJSDate();
    const windows: SlotWindow[] = (slot ? [slot] : times)
      .map((time) => {
        const startsAt = toZonedDateTime(date, time, timezone);
        const endsAt = startsAt.plus({
          minutes: settings.bookingDurationMinutes,
        });
        return {
          time,
          startsAt: startsAt.toJSDate(),
          endsAt: endsAt.toJSDate(),
          occupiedUntil: endsAt
            .plus({ minutes: settings.bufferMinutes })
            .toJSDate(),
        };
      })
      .filter((w) => w.startsAt > now);

    const { open, available } = await this.checkWindows(id, partySize, windows);

    if (slot) {
      return { date, partySize, slot, available: available.has(slot) };
    }
    return {
      date,
      partySize,
      // Slots inside a closure are not offered at all.
      slots: windows
        .filter((w) => open.has(w.time))
        .map((w) => ({ time: w.time, available: available.has(w.time) })),
    };
  }

  /**
   * Loads tables, combinations, closures and allocations for the whole span of
   * `windows` in one round trip, then decides each slot in memory.
   * Returns the slot times not blocked by a closure (`open`) and those with a free candidate (`available`).
   */
  private async checkWindows(
    restaurantId: string,
    partySize: number,
    windows: SlotWindow[],
  ): Promise<{ open: Set<string>; available: Set<string> }> {
    const open = new Set<string>();
    const available = new Set<string>();
    if (windows.length === 0) return { open, available };

    const from = new Date(
      Math.min(...windows.map((w) => w.startsAt.getTime())),
    );
    const until = new Date(
      Math.max(...windows.map((w) => w.occupiedUntil.getTime())),
    );

    const [tables, combinations, allocations, closures] = await Promise.all([
      this.restaurants.findActiveTables(restaurantId),
      this.restaurants.findActiveCombinations(restaurantId),
      this.restaurants.findBusyAllocations(restaurantId, from, until),
      this.restaurants.findClosures(restaurantId, from, until),
    ]);

    const ranked = rankCandidates(
      buildCandidates(
        tables.map((t) => ({ ...t, isActive: true })),
        combinations.map((c) => ({
          id: c.id,
          priority: c.priority,
          tables: c.resources.map(({ resource }) => ({
            id: resource.id,
            capacity: resource.capacity,
            priority: resource.priority,
            isActive: resource.status === 'ACTIVE',
          })),
        })),
        partySize,
      ),
      partySize,
    );

    for (const w of windows) {
      const closed = closures.some((c) =>
        intervalsOverlap(c.startAt, c.endAt, w.startsAt, w.endsAt),
      );
      if (closed) continue;
      open.add(w.time);

      const busyIds = new Set(
        allocations
          .filter((a) =>
            intervalsOverlap(
              a.allocatedFromAt,
              a.allocatedUntilAt,
              w.startsAt,
              w.occupiedUntil,
            ),
          )
          .map((a) => a.resourceId),
      );
      if (pickFreeCandidate(ranked, busyIds)) available.add(w.time);
    }

    return { open, available };
  }
}
