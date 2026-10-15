import type { PublicUser } from '../users/entities/user.entity.js';
export type BookingActor = Pick<PublicUser, 'id' | 'role' | 'emailVerified'>;
/** Null actor is a guest, never a customerId supplied by a client. */
export interface CreateBookingContext {
  actor: BookingActor | null;
  idempotencyKey: string;
}
