import { Public } from '@nestjs/authentication';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { GetRestaurantAvailabilityDto } from '../dto/availability.dto.js';
import { ListRestaurantsDto } from '../dto/list-restaurants.dto.js';
import { AvailabilityService } from '../services/availability.service.js';
import { RestaurantsService } from '../services/restaurants.service.js';

// Discovery and availability are open to guests (docs/domain/permissions.md).
@Public()
@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get()
  getRestaurants(@Query() query: ListRestaurantsDto) {
    return this.restaurantsService.getAllRestaurants(query);
  }

  @Get(':id')
  getRestaurantById(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.getRestaurantById(id);
  }

  @Get(':id/reviews')
  getRestaurantReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListRestaurantsDto,
  ) {
    return this.restaurantsService.getRestaurantReviews(id, query);
  }

  @Get(':id/availability')
  getRestaurantAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetRestaurantAvailabilityDto,
  ): Promise<unknown> {
    return this.availabilityService.getRestaurantAvailability(id, query);
  }
}
