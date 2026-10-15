import { Module } from '@nestjs/common';
import { SearchController } from './controllers/search.controller.js';
import { SearchService } from './services/search.service.js';

@Module({ controllers: [SearchController], providers: [SearchService] })
export class SearchModule {}
