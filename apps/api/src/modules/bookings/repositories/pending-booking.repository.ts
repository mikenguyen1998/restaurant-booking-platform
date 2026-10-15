import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';
import { BookingRepository } from './booking.repository.js';
import type { CreateBookingRequest, BookingReceipt, BookingView, BookingListResponse, BookingListQuery, AdminBookingListQuery, CancelBookingRequest, RescheduleBookingRequest, ManualBookingRequest, ContactAttemptRequest, ExtendHoldRequest, OwnerBookingChangeRequest, OwnerRescheduleBookingRequest, CorrectBookingOutcomeRequest, AdminCancelBookingRequest, AdminRescheduleBookingRequest } from '@restaurant-platform/shared';
import type { BookingActor, CreateBookingContext } from '../booking.context.js';
/** Replace this binding with a transactional adapter only when implemented. */
@Injectable()
export class PendingBookingRepository extends BookingRepository {
 async createAtomic(_context: CreateBookingContext, _input: CreateBookingRequest): Promise<BookingReceipt> { return pendingFeature('Booking repository create'); }
 async listMine(_actor: BookingActor, _query: BookingListQuery): Promise<BookingListResponse> { return pendingFeature('Booking repository listMine'); }
 async findOne(_actor: BookingActor, _id: string): Promise<BookingView> { return pendingFeature('Booking repository findOne'); }
 async cancelAtomic(_actor: BookingActor, _id: string, _input: CancelBookingRequest): Promise<BookingView> { return pendingFeature('Booking repository cancel'); }
 async rescheduleAtomic(_actor: BookingActor, _id: string, _input: RescheduleBookingRequest): Promise<BookingView> { return pendingFeature('Booking repository reschedule'); }
 async listOwner(_actor: BookingActor, _restaurantId: string, _query: BookingListQuery): Promise<BookingListResponse> { return pendingFeature('Booking repository listOwner'); }
 async findOwner(_actor: BookingActor, _restaurantId: string, _id: string): Promise<BookingView> { return pendingFeature('Booking repository findOwner'); }
 async createManualAtomic(_actor: BookingActor, _restaurantId: string, _input: ManualBookingRequest, _idempotencyKey: string): Promise<BookingView> { return pendingFeature('Booking repository createManual'); }
 async recordArrivalAtomic(_actor: BookingActor, _restaurantId: string, _id: string): Promise<BookingView> { return pendingFeature('Booking repository recordArrival'); }
 async recordContactAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: ContactAttemptRequest): Promise<BookingView> { return pendingFeature('Booking repository recordContact'); }
 async extendHoldAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: ExtendHoldRequest): Promise<BookingView> { return pendingFeature('Booking repository extendHold'); }
 async markNoShowAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: OwnerBookingChangeRequest): Promise<BookingView> { return pendingFeature('Booking repository markNoShow'); }
 async cancelOwnerAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: OwnerBookingChangeRequest): Promise<BookingView> { return pendingFeature('Booking repository cancelOwner'); }
 async rescheduleOwnerAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: OwnerRescheduleBookingRequest): Promise<BookingView> { return pendingFeature('Booking repository rescheduleOwner'); }
 async correctOutcomeAtomic(_actor: BookingActor, _restaurantId: string, _id: string, _input: CorrectBookingOutcomeRequest): Promise<BookingView> { return pendingFeature('Booking repository correctOutcome'); }
 async listAdmin(_actor: BookingActor, _query: AdminBookingListQuery): Promise<BookingListResponse> { return pendingFeature('Booking repository listAdmin'); }
 async findAdmin(_actor: BookingActor, _id: string): Promise<BookingView> { return pendingFeature('Booking repository findAdmin'); }
 async cancelAdminAtomic(_actor: BookingActor, _id: string, _input: AdminCancelBookingRequest): Promise<BookingView> { return pendingFeature('Booking repository cancelAdmin'); }
 async rescheduleAdminAtomic(_actor: BookingActor, _id: string, _input: AdminRescheduleBookingRequest): Promise<BookingView> { return pendingFeature('Booking repository rescheduleAdmin'); }
}
