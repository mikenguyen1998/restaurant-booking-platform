import type { PageResult } from './api.js';
/** Proposed transport contracts; not proof of implemented booking policy/storage. */
export interface BookingContact {
  name: string;
  phone: string;
  email?: string;
}
export interface CreateBookingRequest {
  restaurantId: string;
  date: string;
  slot: string;
  partySize: number;
  preferredResourceType?: 'TABLE' | 'VIP_ROOM';
  contact?: BookingContact;
  specialRequest?: string;
}
export interface RescheduleBookingRequest {
  date: string;
  slot: string;
  partySize: number;
  reason?: string;
}
export interface CancelBookingRequest {
  reason?: string;
}
export const bookingStatuses = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
  'EXPIRED',
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];
export interface BookingListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  from?: string;
  to?: string;
}
export interface AdminBookingListQuery extends BookingListQuery {
  restaurantId?: string;
}
/** Private account/owner/admin view. Never use this as a guest replay payload. */
export interface BookingView {
  id: string;
  reference: string;
  restaurantId: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  partySize: number;
  contact: { name: string; phone: string | null; email: string | null };
  preferredResourceType: 'TABLE' | 'VIP_ROOM' | null;
  specialRequest: string | null;
  vipFee: {
    amount: string;
    currencyCode: string;
    collection: 'AT_RESTAURANT';
  } | null;
}
/** Deliberately limited receipt; secure guest idempotency scoping/replay remains #12. */
export type BookingReceipt = Pick<
  BookingView,
  | 'id'
  | 'reference'
  | 'restaurantId'
  | 'status'
  | 'startsAt'
  | 'endsAt'
  | 'partySize'
  | 'vipFee'
>;
export type BookingListResponse = PageResult<BookingView>;
export interface OwnerBookingChangeRequest {
  reason: string;
  contactEvidence: string;
}
export interface OwnerRescheduleBookingRequest
  extends RescheduleBookingRequest, OwnerBookingChangeRequest {
  reason: string;
}
export type ManualBookingRequest = Omit<
  CreateBookingRequest,
  'restaurantId' | 'contact'
> & { contact: BookingContact; reason: string };
/** Contact outcome vocabulary/hold storage are technical proposals, not new policy. */
export interface ContactAttemptRequest {
  outcome: 'REACHED' | 'UNREACHABLE';
  note: string;
}
export interface ExtendHoldRequest {
  holdUntil: string;
  reason: string;
}
export interface CorrectBookingOutcomeRequest {
  status: 'COMPLETED' | 'NO_SHOW';
  reason: string;
}
export interface AdminCancelBookingRequest {
  reason: string;
}
export interface AdminRescheduleBookingRequest extends RescheduleBookingRequest {
  reason: string;
}
