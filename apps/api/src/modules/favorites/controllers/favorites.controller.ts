import { Controller, Delete, Get, Post } from '@nestjs/common';

import { FavoritesService } from '../services/favorites.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}
  @Get('') list() {
    return this.service.list();
  }
  @Post(':id') add() {
    return this.service.add();
  }
  @Delete(':id') remove() {
    return this.service.remove();
  }
}
