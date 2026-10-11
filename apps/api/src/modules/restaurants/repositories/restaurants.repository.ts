import { Injectable } from '@nestjs/common';
import type { DayOfWeek, Prisma } from '@restaurant-platform/database';
import { PrismaService } from '../../../database/prisma.service.js';

export interface RestaurantFilters {
  searchName?: string;
  citySlug?: string;
  districtSlug?: string;
  priceLevel?: number;
  cuisineSlug?: string;
}

export interface Page {
  skip: number;
  take: number;
}

const LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  city: true,
  district: true,
  address: true,
  latitude: true,
  longitude: true,
  priceLevel: true,
  currencyCode: true,
} satisfies Prisma.RestaurantSelect;

const DETAIL_SELECT = {
  ...LIST_SELECT,
  timezone: true,
  images: true,
  menus: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
  cuisines: { include: { cuisine: true } },
  amenities: { include: { amenity: true } },
  openingHours: true,
  bookingSettings: true,
} satisfies Prisma.RestaurantSelect;

/** All Prisma access for the restaurants module. Services only see plain data. */
@Injectable()
export class RestaurantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Public listing -------------------------------------------------------

  findApproved(filters: RestaurantFilters, page: Page) {
    const where: Prisma.RestaurantWhereInput = {
      status: 'APPROVED',
      ...(filters.searchName && {
        searchName: { contains: filters.searchName },
      }),
      ...(filters.citySlug && { citySlug: filters.citySlug }),
      ...(filters.districtSlug && { districtSlug: filters.districtSlug }),
      ...(filters.priceLevel !== undefined && {
        priceLevel: filters.priceLevel,
      }),
      ...(filters.cuisineSlug && {
        cuisines: { some: { cuisine: { slug: filters.cuisineSlug } } },
      }),
    };

    return this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        skip: page.skip,
        take: page.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: LIST_SELECT,
      }),
      this.prisma.restaurant.count({ where }),
    ]);
  }

  findApprovedById(id: string) {
    return this.prisma.restaurant.findFirst({
      where: { id, status: 'APPROVED' },
      select: DETAIL_SELECT,
    });
  }

  findPublishedReviews(restaurantId: string, page: Page) {
    const where = { restaurantId, status: 'PUBLISHED' as const };

    return this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip: page.skip,
        take: page.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.review.count({ where }),
    ]);
  }

  // --- Availability ---------------------------------------------------------

  /** Restaurant status/timezone plus its booking settings (null settings if not configured). */
  findBookingContext(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      select: { status: true, timezone: true, bookingSettings: true },
    });
  }

  findOpeningHour(restaurantId: string, dayOfWeek: DayOfWeek) {
    return this.prisma.openingHour.findUnique({
      where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek } },
    });
  }

  /** Active tables of the restaurant (capacity filtering happens in the allocation domain). */
  findActiveTables(restaurantId: string) {
    return this.prisma.restaurantResource.findMany({
      where: { restaurantId, status: 'ACTIVE' },
      select: { id: true, capacity: true, priority: true },
    });
  }

  /** Active combination rules with their member tables (members may be inactive). */
  findActiveCombinations(restaurantId: string) {
    return this.prisma.resourceCombinationRule.findMany({
      where: { restaurantId, isActive: true },
      select: {
        id: true,
        priority: true,
        resources: {
          select: {
            resource: {
              select: {
                id: true,
                capacity: true,
                priority: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  /** Active table allocations overlapping the half-open window [from, until). */
  findBusyAllocations(restaurantId: string, from: Date, until: Date) {
    return this.prisma.bookingResource.findMany({
      where: {
        resource: { restaurantId },
        isActive: true,
        allocatedFromAt: { lt: until },
        allocatedUntilAt: { gt: from },
      },
      select: {
        resourceId: true,
        allocatedFromAt: true,
        allocatedUntilAt: true,
      },
    });
  }

  /** Closures (blackouts) overlapping the half-open window [from, until). */
  findClosures(restaurantId: string, from: Date, until: Date) {
    return this.prisma.restaurantClosure.findMany({
      where: { restaurantId, startAt: { lt: until }, endAt: { gt: from } },
      select: { startAt: true, endAt: true },
    });
  }
}
