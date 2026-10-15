import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class NotificationsService {
  list() {
    return pendingFeature('Notification listing');
  }
  markRead() {
    return pendingFeature('Notification read state');
  }
  preferences() {
    return pendingFeature('Reminder preferences');
  }
}
