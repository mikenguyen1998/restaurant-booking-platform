import { Module } from '@nestjs/common';
import { FavoritesController } from './controllers/favorites.controller.js';
import { FavoritesService } from './services/favorites.service.js';

@Module({ controllers: [FavoritesController], providers: [FavoritesService] })
export class FavoritesModule {}
