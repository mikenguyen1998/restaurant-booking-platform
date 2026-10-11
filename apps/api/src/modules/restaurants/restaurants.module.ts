import { Module } from '@nestjs/common';
import { RestaurantsController } from './controllers/restaurants.controller.js';
import { RestaurantsService } from './services/restaurants.service.js';
import { AvailabilityService } from './services/availability.service.js';
import { RestaurantsRepository } from './repositories/restaurants.repository.js';
import { PrismaModule } from '../../database/prisma.module.js';

// Controller → Service (rules) → Repository (Prisma). Only repositories touch the database.
@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantsRepository, RestaurantsService, AvailabilityService],
  imports: [PrismaModule],
  exports: [AvailabilityService],
})
export class RestaurantsModule {}
