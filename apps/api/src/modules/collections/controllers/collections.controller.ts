import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { CollectionsService } from '../services/collections.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('collections')
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}
  @Get('') list() {
    return this.service.list();
  }
  @Post('') create() {
    return this.service.create();
  }
  @Public() @Get(':id') findOne() {
    return this.service.findOne();
  }
  @Patch(':id') update() {
    return this.service.update();
  }
  @Delete(':id') remove() {
    return this.service.remove();
  }
  @Post(':id/restaurants') addRestaurant() {
    return this.service.addRestaurant();
  }
  @Delete(':id/restaurants/:restaurantId') removeRestaurant() {
    return this.service.removeRestaurant();
  }
}
