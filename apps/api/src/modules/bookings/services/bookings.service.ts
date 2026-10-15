import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';
import type {
  CreateBookingDto,
  RescheduleBookingDto,
  BookingReasonDto,
} from '../dto/booking.dto.js';

@Injectable()
export class BookingsService {
  // TODO: verified-email/guest contacts, scoped idempotency, snapshots, transactional allocation.
  create(_input: CreateBookingDto) {
    return pendingFeature('Booking creation');
  }
  listMine() {
    return pendingFeature('Customer booking history');
  }
  findOne(_id: string) {
    return pendingFeature('Booking access');
  }
  cancel(_id: string, _input: BookingReasonDto) {
    return pendingFeature('Booking cancellation');
  }
  reschedule(_id: string, _input: RescheduleBookingDto) {
    return pendingFeature('Atomic booking rescheduling');
  }
}
