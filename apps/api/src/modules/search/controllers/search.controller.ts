import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { SearchService } from '../services/search.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}
  @Public() @Get('') search() {
    return this.service.search();
  }
}
