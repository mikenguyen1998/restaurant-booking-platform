import { Inject, Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import type {
  CreateBookingRequest,
  BookingReceipt,
  BookingView,
  BookingListResponse,
  BookingListQuery,
  AdminBookingListQuery,
  CancelBookingRequest,
  RescheduleBookingRequest,
  ManualBookingRequest,
  ContactAttemptRequest,
  ExtendHoldRequest,
  OwnerBookingChangeRequest,
  OwnerRescheduleBookingRequest,
  CorrectBookingOutcomeRequest,
  AdminCancelBookingRequest,
  AdminRescheduleBookingRequest,
} from '@restaurant-platform/shared';
import type { BookingActor, CreateBookingContext } from '../booking.context.js';
/** Use-case boundaries only. Authorize before repository access; no business logic yet. */
@Injectable()
export class BookingsService {
  constructor(
    @Inject(BookingRepository) private readonly repository: BookingRepository,
  ) {}
  async create(
    _context: CreateBookingContext,
    _input: CreateBookingRequest,
  ): Promise<BookingReceipt> {
    return pendingFeature('Booking create');
  }
  async listMine(
    _actor: BookingActor,
    _query: BookingListQuery,
  ): Promise<BookingListResponse> {
    return pendingFeature('Booking listMine');
  }
  async findOne(_actor: BookingActor, _id: string): Promise<BookingView> {
    return pendingFeature('Booking findOne');
  }
  async cancel(
    _actor: BookingActor,
    _id: string,
    _input: CancelBookingRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking cancel');
  }
  async reschedule(
    _actor: BookingActor,
    _id: string,
    _input: RescheduleBookingRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking reschedule');
  }
  async listOwner(
    _actor: BookingActor,
    _restaurantId: string,
    _query: BookingListQuery,
  ): Promise<BookingListResponse> {
    return pendingFeature('Booking listOwner');
  }
  async findOwner(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
  ): Promise<BookingView> {
    return pendingFeature('Booking findOwner');
  }
  async createManual(
    _actor: BookingActor,
    _restaurantId: string,
    _input: ManualBookingRequest,
    _idempotencyKey: string,
  ): Promise<BookingView> {
    return pendingFeature('Booking createManual');
  }
  async recordArrival(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
  ): Promise<BookingView> {
    return pendingFeature('Booking recordArrival');
  }
  async recordContact(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: ContactAttemptRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking recordContact');
  }
  async extendHold(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: ExtendHoldRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking extendHold');
  }
  async markNoShow(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: OwnerBookingChangeRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking markNoShow');
  }
  async cancelOwner(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: OwnerBookingChangeRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking cancelOwner');
  }
  async rescheduleOwner(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: OwnerRescheduleBookingRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking rescheduleOwner');
  }
  async correctOutcome(
    _actor: BookingActor,
    _restaurantId: string,
    _id: string,
    _input: CorrectBookingOutcomeRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking correctOutcome');
  }
  async listAdmin(
    _actor: BookingActor,
    _query: AdminBookingListQuery,
  ): Promise<BookingListResponse> {
    return pendingFeature('Booking listAdmin');
  }
  async findAdmin(_actor: BookingActor, _id: string): Promise<BookingView> {
    return pendingFeature('Booking findAdmin');
  }
  async cancelAdmin(
    _actor: BookingActor,
    _id: string,
    _input: AdminCancelBookingRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking cancelAdmin');
  }
  async rescheduleAdmin(
    _actor: BookingActor,
    _id: string,
    _input: AdminRescheduleBookingRequest,
  ): Promise<BookingView> {
    return pendingFeature('Booking rescheduleAdmin');
  }
}
