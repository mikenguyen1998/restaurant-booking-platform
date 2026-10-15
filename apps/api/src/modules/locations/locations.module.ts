import { Module } from '@nestjs/common';
import { LocationsController } from './controllers/locations.controller.js';
import { LocationsService } from './services/locations.service.js';

@Module({ controllers: [LocationsController], providers: [LocationsService] })
export class LocationsModule {}
