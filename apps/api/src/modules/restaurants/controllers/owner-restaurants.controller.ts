import { Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { OwnerRestaurantsService } from '../services/owner-restaurants.service.js';
// Session-protected, non-operational scaffold. Ownership policies are not implemented.
@Controller('owner/restaurants')
export class OwnerRestaurantsController {
  constructor(private readonly service: OwnerRestaurantsService) {}
  @Get('') list() {
    return this.service.list();
  }
  @Post('') create() {
    return this.service.create();
  }
  @Get(':id') detail() {
    return this.service.detail();
  }
  @Patch(':id') update() {
    return this.service.update();
  }
  @Post(':id/submit') submit() {
    return this.service.submit();
  }
  @Get(':id/resources') resources() {
    return this.service.resources();
  }
  @Post(':id/resources') createResource() {
    return this.service.createResource();
  }
  @Patch(':id/resources/:resourceId') updateResource() {
    return this.service.updateResource();
  }
  @Get(':id/combinations') combinations() {
    return this.service.combinations();
  }
  @Post(':id/combinations') createCombination() {
    return this.service.createCombination();
  }
  @Put(':id/opening-hours') openingHours() {
    return this.service.openingHours();
  }
  @Put(':id/booking-settings') settings() {
    return this.service.settings();
  }
  @Get(':id/closures') closures() {
    return this.service.closures();
  }
  @Post(':id/closures') createClosure() {
    return this.service.createClosure();
  }
}
