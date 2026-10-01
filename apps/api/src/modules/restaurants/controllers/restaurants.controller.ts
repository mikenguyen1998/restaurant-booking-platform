import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RestaurantsService } from '../services/restaurants.service.js';
import { ListRestaurantsDto } from '../dto/list-restaurants.dto.js';
import { AvailabilityService } from '../services/availability.service.js';
import { GetRestaurantAvailabilityDto } from '../dto/availability.dto.js';

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
  ) {
    return this.availabilityService.getRestaurantAvailability(id, query);
  }
}
