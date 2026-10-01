import { Module } from '@nestjs/common';
import { RestaurantsController } from './controllers/restaurants.controller.js';
import { RestaurantsService } from './services/restaurants.service.js';
import { AvailabilityService } from './services/availability.service.js';

// TODO: restaurants module. Structure: controllers/, services/, dto/, entities/, repositories/.
@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantsService, AvailabilityService]
})
export class RestaurantsModule {}
