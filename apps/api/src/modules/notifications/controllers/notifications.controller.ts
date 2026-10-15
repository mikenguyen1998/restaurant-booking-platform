import { Controller, Get, Patch } from '@nestjs/common';

import { NotificationsService } from '../services/notifications.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get('') list() {
    return this.service.list();
  }
  @Patch(':id/read') markRead() {
    return this.service.markRead();
  }
  @Patch('preferences') preferences() {
    return this.service.preferences();
  }
}
