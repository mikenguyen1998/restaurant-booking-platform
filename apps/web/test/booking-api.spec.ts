import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookingApi } from '../src/lib/booking-api';
import { ApiError, errorMessage } from '../src/lib/api';
const restaurantId = 'restaurant';
const id = 'booking';
const reason = { reason: 'Requested' };
const time = { date: '2026-12-31', slot: '18:30', partySize: 3 };
const owner = { ...reason, contactEvidence: 'Phone call' };
const manual = {
  ...time,
  ...reason,
  contact: { name: 'An', phone: '0900000000' },
};
afterEach(() => vi.unstubAllGlobals());
describe('Booking client transport', () => {
  it.each([
    [
      'create',
      () => bookingApi.create({ restaurantId, ...time }, 'key'),
      'POST',
      '/bookings',
      { restaurantId, ...time },
      'key',
    ],
    [
      'list',
      () => bookingApi.listMine({ page: 2, limit: 10, status: 'CONFIRMED' }),
      'GET',
      '/bookings?page=2&limit=10&status=CONFIRMED',
      undefined,
      undefined,
    ],
    [
      'detail',
      () => bookingApi.detail(id),
      'GET',
      '/bookings/booking',
      undefined,
      undefined,
    ],
    [
      'cancel',
      () => bookingApi.cancel(id, reason),
      'POST',
      '/bookings/booking/cancel',
      reason,
      undefined,
    ],
    [
      'reschedule',
      () => bookingApi.reschedule(id, time),
      'POST',
      '/bookings/booking/reschedule',
      time,
      undefined,
    ],
    [
      'ownerList',
      () => bookingApi.ownerList(restaurantId),
      'GET',
      '/owner/restaurants/restaurant/bookings',
      undefined,
      undefined,
    ],
    [
      'ownerDetail',
      () => bookingApi.ownerDetail(restaurantId, id),
      'GET',
      '/owner/restaurants/restaurant/bookings/booking',
      undefined,
      undefined,
    ],
    [
      'manual',
      () => bookingApi.manual(restaurantId, manual, 'key'),
      'POST',
      '/owner/restaurants/restaurant/bookings',
      manual,
      'key',
    ],
    [
      'arrival',
      () => bookingApi.arrival(restaurantId, id),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/arrival',
      undefined,
      undefined,
    ],
    [
      'contact',
      () =>
        bookingApi.contact(restaurantId, id, {
          outcome: 'UNREACHABLE',
          note: 'Call',
        }),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/contact',
      { outcome: 'UNREACHABLE', note: 'Call' },
      undefined,
    ],
    [
      'hold',
      () =>
        bookingApi.hold(restaurantId, id, {
          holdUntil: '2026-12-31T19:00:00Z',
          ...reason,
        }),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/hold',
      { holdUntil: '2026-12-31T19:00:00Z', ...reason },
      undefined,
    ],
    [
      'noShow',
      () => bookingApi.noShow(restaurantId, id, owner),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/no-show',
      owner,
      undefined,
    ],
    [
      'ownerCancel',
      () => bookingApi.ownerCancel(restaurantId, id, owner),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/cancel',
      owner,
      undefined,
    ],
    [
      'ownerReschedule',
      () => bookingApi.ownerReschedule(restaurantId, id, { ...time, ...owner }),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/reschedule',
      { ...time, ...owner },
      undefined,
    ],
    [
      'correct',
      () =>
        bookingApi.correct(restaurantId, id, { status: 'NO_SHOW', ...reason }),
      'POST',
      '/owner/restaurants/restaurant/bookings/booking/correct',
      { status: 'NO_SHOW', ...reason },
      undefined,
    ],
    [
      'adminList',
      () => bookingApi.adminList({ restaurantId }),
      'GET',
      '/admin/bookings?restaurantId=restaurant',
      undefined,
      undefined,
    ],
    [
      'adminDetail',
      () => bookingApi.adminDetail(id),
      'GET',
      '/admin/bookings/booking',
      undefined,
      undefined,
    ],
    [
      'adminCancel',
      () => bookingApi.adminCancel(id, reason),
      'POST',
      '/admin/bookings/booking/cancel',
      reason,
      undefined,
    ],
    [
      'adminReschedule',
      () => bookingApi.adminReschedule(id, { ...time, ...reason }),
      'POST',
      '/admin/bookings/booking/reschedule',
      { ...time, ...reason },
      undefined,
    ],
  ] as const)(
    '%s serializes the agreed method/path/body and sends credentials',
    async (_name, call, method, path, body, key) => {
      const fetcher = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: 'pending' }), { status: 501 }),
        );
      vi.stubGlobal('fetch', fetcher);
      await expect(call()).rejects.toBeInstanceOf(ApiError);
      const [url, options] = fetcher.mock.calls[0]!;
      expect(new URL(url).pathname + new URL(url).search).toBe(path);
      expect(options.method ?? 'GET').toBe(method);
      expect(options.credentials).toBe('include');
      expect(options.body).toBe(
        body === undefined ? undefined : JSON.stringify(body),
      );
      expect(options.headers['Idempotency-Key']).toBe(key);
    },
  );
  it('makes pending explicit instead of resolving a fake booking', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"message":"pending"}', { status: 501 }),
        ),
    );
    try {
      await bookingApi.create({ restaurantId, ...time }, 'key');
      expect.unreachable();
    } catch (error) {
      expect(errorMessage(error)).toContain('Chưa có thay đổi nào được lưu');
    }
  });
  it('forwards cancellation of obsolete reads', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetcher);
    await bookingApi.detail(id, controller.signal);
    expect(fetcher.mock.calls[0]![1].signal).toBe(controller.signal);
  });
});
