import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Review } from '@restaurant-platform/database';
import { normalizeSearch, slugify } from '@restaurant-platform/shared';
import {
  getPagination,
  PaginatedResult,
} from '../../../common/utils/pagination.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { ListRestaurantsDto } from '../dto/list-restaurants.dto.js';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRestaurants(options: ListRestaurantsDto) {
    const pagination = getPagination(options.page, options.limit);
    const searchName = options.name ? normalizeSearch(options.name) : undefined;
    const citySlug = options.city ? slugify(options.city) : undefined;
    const districtSlug = options.district
      ? slugify(options.district)
      : undefined;
    const cuisine = options.cuisine?.trim();

    const where: Prisma.RestaurantWhereInput = {
      status: 'APPROVED',
      ...(searchName && { searchName: { contains: searchName } }),
      ...(citySlug && { citySlug }),
      ...(districtSlug && { districtSlug }),
      ...(options.priceLevel !== undefined && {
        priceLevel: options.priceLevel,
      }),
      ...(cuisine && {
        cuisines: { some: { cuisine: { slug: cuisine } } },
      }),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // Optional: shows newest records first
        select: {
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
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        currentPage: pagination.page,
      },
    };
  }

  async getRestaurantById(id: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id,
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        district: true,
        address: true,
        latitude: true,
        longitude: true,
        timezone: true,
        currencyCode: true,
        priceLevel: true,
        images: true,
        menus: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        cuisines: {
          include: {
            cuisine: true,
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        openingHours: true,
        bookingSettings: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async getRestaurantReviews(
    restaurantId: string,
    { page, limit }: ListRestaurantsDto,
  ): Promise<PaginatedResult<Review>> {
    const pagination = getPagination(page, limit);

    const where = {
      restaurantId,
      status: 'PUBLISHED' as const,
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),

      this.prisma.review.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        currentPage: pagination.page,
      },
    };
  }
}
