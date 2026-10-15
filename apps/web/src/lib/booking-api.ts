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
import { apiRequest } from './api';
function query(input: BookingListQuery | AdminBookingListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input))
    if (value !== undefined) params.set(key, String(value));
  return params.size ? `?${params}` : '';
}
const id = (value: string) => encodeURIComponent(value);
const owner = (restaurantId: string) =>
  `/owner/restaurants/${id(restaurantId)}/bookings`;
const post = <T>(path: string, body?: unknown, key?: string) =>
  apiRequest<T>(path, {
    method: 'POST',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...(key ? { headers: { 'Idempotency-Key': key } } : {}),
  });
export const bookingApi = {
  create: (input: CreateBookingRequest, key: string) =>
    post<BookingReceipt>('/bookings', input, key),
  listMine: (input: BookingListQuery = {}, signal?: AbortSignal) =>
    apiRequest<BookingListResponse>('/bookings' + query(input), { signal }),
  detail: (bookingId: string, signal?: AbortSignal) =>
    apiRequest<BookingView>(`/bookings/${id(bookingId)}`, { signal }),
  cancel: (bookingId: string, input: CancelBookingRequest) =>
    post<BookingView>(`/bookings/${id(bookingId)}/cancel`, input),
  reschedule: (bookingId: string, input: RescheduleBookingRequest) =>
    post<BookingView>(`/bookings/${id(bookingId)}/reschedule`, input),
  ownerList: (
    restaurantId: string,
    input: BookingListQuery = {},
    signal?: AbortSignal,
  ) =>
    apiRequest<BookingListResponse>(owner(restaurantId) + query(input), {
      signal,
    }),
  ownerDetail: (
    restaurantId: string,
    bookingId: string,
    signal?: AbortSignal,
  ) =>
    apiRequest<BookingView>(`${owner(restaurantId)}/${id(bookingId)}`, {
      signal,
    }),
  manual: (restaurantId: string, input: ManualBookingRequest, key: string) =>
    post<BookingView>(owner(restaurantId), input, key),
  arrival: (restaurantId: string, bookingId: string) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/arrival`),
  contact: (
    restaurantId: string,
    bookingId: string,
    input: ContactAttemptRequest,
  ) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/contact`, input),
  hold: (restaurantId: string, bookingId: string, input: ExtendHoldRequest) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/hold`, input),
  noShow: (
    restaurantId: string,
    bookingId: string,
    input: OwnerBookingChangeRequest,
  ) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/no-show`, input),
  ownerCancel: (
    restaurantId: string,
    bookingId: string,
    input: OwnerBookingChangeRequest,
  ) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/cancel`, input),
  ownerReschedule: (
    restaurantId: string,
    bookingId: string,
    input: OwnerRescheduleBookingRequest,
  ) =>
    post<BookingView>(
      `${owner(restaurantId)}/${id(bookingId)}/reschedule`,
      input,
    ),
  correct: (
    restaurantId: string,
    bookingId: string,
    input: CorrectBookingOutcomeRequest,
  ) =>
    post<BookingView>(`${owner(restaurantId)}/${id(bookingId)}/correct`, input),
  adminList: (input: AdminBookingListQuery = {}, signal?: AbortSignal) =>
    apiRequest<BookingListResponse>('/admin/bookings' + query(input), {
      signal,
    }),
  adminDetail: (bookingId: string, signal?: AbortSignal) =>
    apiRequest<BookingView>(`/admin/bookings/${id(bookingId)}`, { signal }),
  adminCancel: (bookingId: string, input: AdminCancelBookingRequest) =>
    post<BookingView>(`/admin/bookings/${id(bookingId)}/cancel`, input),
  adminReschedule: (bookingId: string, input: AdminRescheduleBookingRequest) =>
    post<BookingView>(`/admin/bookings/${id(bookingId)}/reschedule`, input),
};
