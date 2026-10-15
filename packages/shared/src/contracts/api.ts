/** HTTP transport contracts. No database or framework dependencies. */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PageResult<T> {
  data: T[];
  meta: PaginationMeta;
}
export type AccountRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN';
export interface CurrentAccount {
  id: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  name: string;
  role: AccountRole;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  district: string | null;
  address: string;
  latitude: string;
  longitude: string;
  priceLevel: number;
  currencyCode: string;
}
export interface RestaurantDetail extends RestaurantSummary {
  timezone: string;
  images: { id: string; url: string; altText: string | null }[];
  menus: { id: string; name: string; isActive: boolean }[];
  cuisines: { cuisine: { id: string; name: string; slug: string } }[];
  amenities: { amenity: { id: string; name: string; slug: string } }[];
  openingHours: { dayOfWeek: string; openTime: string; closeTime: string }[];
  bookingSettings: {
    bookingDurationMinutes: number;
    slotIntervalMinutes: number;
    bufferMinutes: number;
    cancellationDeadlineMins: number;
  } | null;
}
export interface RestaurantReview {
  id: string;
  overallRating: number;
  foodRating: number;
  serviceRating: number;
  atmosphereRating: number;
  content: string | null;
  createdAt: string;
}
export interface AvailabilitySlots {
  date: string;
  partySize: number;
  slots: { time: string; available: boolean }[];
}
export interface SessionView {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  userAgent: string | null;
  current: boolean;
}

export * from './booking.js';
