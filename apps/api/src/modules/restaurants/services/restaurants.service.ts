import { Injectable, NotFoundException } from '@nestjs/common';
import { normalizeSearch, slugify } from '@restaurant-platform/shared';
import {
  getPagination,
  toPaginatedResult,
} from '../../../common/utils/pagination.js';
import { ListRestaurantsDto } from '../dto/list-restaurants.dto.js';
import { RestaurantsRepository } from '../repositories/restaurants.repository.js';

@Injectable()
export class RestaurantsService {
  constructor(private readonly restaurants: RestaurantsRepository) {}

  async getAllRestaurants(options: ListRestaurantsDto) {
    const pagination = getPagination(options.page, options.limit);

    const [data, totalItems] = await this.restaurants.findApproved(
      {
        searchName: options.name ? normalizeSearch(options.name) : undefined,
        citySlug: options.city ? slugify(options.city) : undefined,
        districtSlug: options.district ? slugify(options.district) : undefined,
        priceLevel: options.priceLevel,
        cuisineSlug: options.cuisine?.trim() || undefined,
      },
      { skip: pagination.skip, take: pagination.limit },
    );

    return toPaginatedResult(data, totalItems, pagination);
  }

  async getRestaurantById(id: string) {
    const restaurant = await this.restaurants.findApprovedById(id);

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async getRestaurantReviews(
    restaurantId: string,
    { page, limit }: ListRestaurantsDto,
  ) {
    const pagination = getPagination(page, limit);

    const [data, totalItems] = await this.restaurants.findPublishedReviews(
      restaurantId,
      { skip: pagination.skip, take: pagination.limit },
    );

    return toPaginatedResult(data, totalItems, pagination);
  }
}
