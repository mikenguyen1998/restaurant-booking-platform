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
/** Persistence port, not an implementation. Atomic writes must include allocations,
 * accepted snapshots, idempotency/audit and durable notification intent as applicable.
 * Future services must enforce role/ownership before calling this port.
 */
export abstract class BookingRepository {
  abstract createAtomic(
    context: CreateBookingContext,
    input: CreateBookingRequest,
  ): Promise<BookingReceipt>;
  abstract listMine(
    actor: BookingActor,
    query: BookingListQuery,
  ): Promise<BookingListResponse>;
  abstract findOne(actor: BookingActor, id: string): Promise<BookingView>;
  abstract cancelAtomic(
    actor: BookingActor,
    id: string,
    input: CancelBookingRequest,
  ): Promise<BookingView>;
  abstract rescheduleAtomic(
    actor: BookingActor,
    id: string,
    input: RescheduleBookingRequest,
  ): Promise<BookingView>;
  abstract listOwner(
    actor: BookingActor,
    restaurantId: string,
    query: BookingListQuery,
  ): Promise<BookingListResponse>;
  abstract findOwner(
    actor: BookingActor,
    restaurantId: string,
    id: string,
  ): Promise<BookingView>;
  abstract createManualAtomic(
    actor: BookingActor,
    restaurantId: string,
    input: ManualBookingRequest,
    idempotencyKey: string,
  ): Promise<BookingView>;
  abstract recordArrivalAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
  ): Promise<BookingView>;
  abstract recordContactAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: ContactAttemptRequest,
  ): Promise<BookingView>;
  abstract extendHoldAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: ExtendHoldRequest,
  ): Promise<BookingView>;
  abstract markNoShowAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: OwnerBookingChangeRequest,
  ): Promise<BookingView>;
  abstract cancelOwnerAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: OwnerBookingChangeRequest,
  ): Promise<BookingView>;
  abstract rescheduleOwnerAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: OwnerRescheduleBookingRequest,
  ): Promise<BookingView>;
  abstract correctOutcomeAtomic(
    actor: BookingActor,
    restaurantId: string,
    id: string,
    input: CorrectBookingOutcomeRequest,
  ): Promise<BookingView>;
  abstract listAdmin(
    actor: BookingActor,
    query: AdminBookingListQuery,
  ): Promise<BookingListResponse>;
  abstract findAdmin(actor: BookingActor, id: string): Promise<BookingView>;
  abstract cancelAdminAtomic(
    actor: BookingActor,
    id: string,
    input: AdminCancelBookingRequest,
  ): Promise<BookingView>;
  abstract rescheduleAdminAtomic(
    actor: BookingActor,
    id: string,
    input: AdminRescheduleBookingRequest,
  ): Promise<BookingView>;
}
