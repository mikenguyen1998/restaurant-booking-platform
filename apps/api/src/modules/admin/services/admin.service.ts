import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class AdminService {
  restaurants() {
    return pendingFeature('Admin restaurant review queue');
  }
  approve() {
    return pendingFeature('Restaurant approval');
  }
  reject() {
    return pendingFeature('Restaurant rejection');
  }
  suspend() {
    return pendingFeature('Restaurant suspension');
  }
  bookings() {
    return pendingFeature('Admin booking listing');
  }
  cancelBooking() {
    return pendingFeature('Admin cancellation');
  }
  rescheduleBooking() {
    return pendingFeature('Admin rescheduling');
  }
  users() {
    return pendingFeature('Admin user management');
  }
  reviews() {
    return pendingFeature('Review moderation');
  }
  moderateReview() {
    return pendingFeature('Review moderation action');
  }
  audit() {
    return pendingFeature('Audit log access');
  }
  reports() {
    return pendingFeature('Platform analytics');
  }
}
