import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { LocationsService } from '../services/locations.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}
  @Public() @Get('cities') cities() {
    return this.service.cities();
  }
  @Public() @Get('cuisines') cuisines() {
    return this.service.cuisines();
  }
  @Public() @Get('amenities') amenities() {
    return this.service.amenities();
  }
}
