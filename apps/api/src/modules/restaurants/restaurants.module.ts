import { OwnerRestaurantsController } from './controllers/owner-restaurants.controller.js';
import { OwnerRestaurantsService } from './services/owner-restaurants.service.js';
import { Module } from '@nestjs/common';
import { RestaurantsController } from './controllers/restaurants.controller.js';
import { RestaurantsService } from './services/restaurants.service.js';
import { AvailabilityService } from './services/availability.service.js';
import { RestaurantsRepository } from './repositories/restaurants.repository.js';
import { PrismaModule } from '../../database/prisma.module.js';

// Controller → Service (rules) → Repository (Prisma). Only repositories touch the database.
@Module({
  controllers: [RestaurantsController, OwnerRestaurantsController],
  providers: [
    RestaurantsRepository,
    RestaurantsService,
    AvailabilityService,
    OwnerRestaurantsService,
  ],
  imports: [PrismaModule],
  exports: [AvailabilityService],
})
export class RestaurantsModule {}
