import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AuthenticationModule,
  AuthenticationProvider,
  AuthenticationRegistry,
} from '@nestjs/authentication';
import {
  type ExecutionContext,
  type INestApplication,
  NotImplementedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module.js';
import { BookingsService } from './services/bookings.service.js';
import { BookingRepository } from './repositories/booking.repository.js';
import { PendingBookingRepository } from './repositories/pending-booking.repository.js';
import {
  CreateBookingDto,
  ManualBookingDto,
  BookingListDto,
  OwnerChangeDto,
  CorrectOutcomeDto,
  ExtendHoldDto,
} from './dto/booking.dto.js';
import { bookingKey } from './controllers/booking.transport.js';
const actor = {
  id: '44444444-4444-4444-8444-444444444444',
  role: 'CUSTOMER' as const,
  emailVerified: true,
};
const restaurantId = '22222222-2222-4222-8222-222222222222';
const bookingId = '33333333-3333-4333-8333-333333333333';
const create = {
  restaurantId,
  date: '2026-12-31',
  slot: '18:30',
  partySize: 2,
};
/** Only test credentials are synthetic; the real library guard and CurrentUser decorator run. */
class FixtureIdentity extends AuthenticationProvider<typeof actor> {
  authenticate(context: ExecutionContext) {
    return this.header(context, 'x-test-session') === 'live'
      ? { user: actor }
      : null;
  }
}
describe('Booking skeleton HTTP boundary', () => {
  let app: INestApplication;
  let base: string;
  let service: BookingsService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationModule.forRoot(), BookingsModule],
      providers: [
        {
          provide: FixtureIdentity,
          inject: [AuthenticationRegistry],
          useFactory: (registry: AuthenticationRegistry) => {
            const identity = new FixtureIdentity();
            registry.registerProvider(identity);
            return identity;
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
    service = app.get(BookingsService);
  });
  afterAll(async () => {
    await app?.close();
  });
  it('binds the explicit pending repository through Nest DI', () => {
    expect(app.get(BookingRepository)).toBeInstanceOf(PendingBookingRepository);
  });
  it.each([false, true])(
    'optional authentication preserves server identity (session=%s)',
    async (live) => {
      const spy = vi.spyOn(service, 'create');
      const response = await fetch(base + '/bookings', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': 'intent-one',
          ...(live ? { 'x-test-session': 'live' } : {}),
        },
        body: JSON.stringify(create),
      });
      expect(response.status).toBe(501);
      expect(spy).toHaveBeenLastCalledWith(
        { actor: live ? actor : null, idempotencyKey: 'intent-one' },
        create,
      );
      spy.mockRestore();
    },
  );
  it('does not accept a create intent without a key', async () => {
    const response = await fetch(base + '/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(create),
    });
    expect(response.status).toBe(400);
  });
  it.each([
    '/bookings',
    '/bookings/' + bookingId,
    '/owner/restaurants/' + restaurantId + '/bookings',
    '/admin/bookings',
  ])('requires a session on %s', async (path) => {
    expect((await fetch(base + path)).status).toBe(401);
  });
  it.each([
    ['GET', '/bookings', 'listMine', undefined, [actor, {}]],
    ['GET', '/bookings/' + bookingId, 'findOne', undefined, [actor, bookingId]],
    [
      'POST',
      '/bookings/' + bookingId + '/cancel',
      'cancel',
      { reason: 'Customer request' },
      [actor, bookingId, { reason: 'Customer request' }],
    ],
    [
      'POST',
      '/bookings/' + bookingId + '/reschedule',
      'reschedule',
      { date: '2026-12-31', slot: '20:00', partySize: 3 },
      [actor, bookingId, { date: '2026-12-31', slot: '20:00', partySize: 3 }],
    ],
    [
      'GET',
      '/owner/restaurants/' + restaurantId + '/bookings',
      'listOwner',
      undefined,
      [actor, restaurantId, {}],
    ],
    [
      'POST',
      '/owner/restaurants/' +
        restaurantId +
        '/bookings/' +
        bookingId +
        '/arrival',
      'recordArrival',
      undefined,
      [actor, restaurantId, bookingId],
    ],
    [
      'POST',
      '/admin/bookings/' + bookingId + '/cancel',
      'cancelAdmin',
      { reason: 'Support request' },
      [actor, bookingId, { reason: 'Support request' }],
    ],

    [
      'GET',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}`,
      'findOwner',
      undefined,
      [actor, restaurantId, bookingId],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings`,
      'createManual',
      {
        date: create.date,
        slot: create.slot,
        partySize: 2,
        contact: { name: 'An', phone: '0900000000' },
        reason: 'Walk in',
      },
      [
        actor,
        restaurantId,
        {
          date: create.date,
          slot: create.slot,
          partySize: 2,
          contact: { name: 'An', phone: '0900000000' },
          reason: 'Walk in',
        },
        'key',
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/contact`,
      'recordContact',
      { outcome: 'UNREACHABLE', note: 'Call' },
      [
        actor,
        restaurantId,
        bookingId,
        { outcome: 'UNREACHABLE', note: 'Call' },
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/hold`,
      'extendHold',
      { holdUntil: '2026-12-31T19:00:00Z', reason: 'Requested' },
      [
        actor,
        restaurantId,
        bookingId,
        { holdUntil: '2026-12-31T19:00:00Z', reason: 'Requested' },
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/no-show`,
      'markNoShow',
      { reason: 'Absent', contactEvidence: 'Calls failed' },
      [
        actor,
        restaurantId,
        bookingId,
        { reason: 'Absent', contactEvidence: 'Calls failed' },
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/cancel`,
      'cancelOwner',
      { reason: 'Requested', contactEvidence: 'Phone' },
      [
        actor,
        restaurantId,
        bookingId,
        { reason: 'Requested', contactEvidence: 'Phone' },
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/reschedule`,
      'rescheduleOwner',
      {
        date: create.date,
        slot: create.slot,
        partySize: 3,
        reason: 'Requested',
        contactEvidence: 'Phone',
      },
      [
        actor,
        restaurantId,
        bookingId,
        {
          date: create.date,
          slot: create.slot,
          partySize: 3,
          reason: 'Requested',
          contactEvidence: 'Phone',
        },
      ],
    ],
    [
      'POST',
      `/owner/restaurants/${restaurantId}/bookings/${bookingId}/correct`,
      'correctOutcome',
      { status: 'NO_SHOW', reason: 'Correction' },
      [
        actor,
        restaurantId,
        bookingId,
        { status: 'NO_SHOW', reason: 'Correction' },
      ],
    ],
    ['GET', '/admin/bookings', 'listAdmin', undefined, [actor, {}]],
    [
      'GET',
      `/admin/bookings/${bookingId}`,
      'findAdmin',
      undefined,
      [actor, bookingId],
    ],
    [
      'POST',
      `/admin/bookings/${bookingId}/reschedule`,
      'rescheduleAdmin',
      { date: create.date, slot: create.slot, partySize: 3, reason: 'Support' },
      [
        actor,
        bookingId,
        {
          date: create.date,
          slot: create.slot,
          partySize: 3,
          reason: 'Support',
        },
      ],
    ],
  ] as const)(
    'forwards identity/params/body without fake success: %s %s',
    async (method, path, name, body, args) => {
      const spy = vi.spyOn(service, name);
      const response = await fetch(base + path, {
        method,
        headers: {
          'x-test-session': 'live',
          'idempotency-key': 'key',
          'content-type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      expect(response.status).toBe(501);
      expect(spy).toHaveBeenLastCalledWith(...args);
      spy.mockRestore();
    },
  );
});
describe('Booking transport contract (not booking policy)', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const validate = (
    type:
      | typeof CreateBookingDto
      | typeof ManualBookingDto
      | typeof BookingListDto
      | typeof OwnerChangeDto
      | typeof CorrectOutcomeDto
      | typeof ExtendHoldDto,
    value: unknown,
  ) => pipe.transform(value, { type: 'body', metatype: type });
  it('accepts guest contact with optional email', async () => {
    await expect(
      validate(CreateBookingDto, {
        ...create,
        contact: { name: 'An', phone: '0900000000' },
      }),
    ).resolves.toMatchObject(create);
  });
  it.each(['actorId', 'ownerId', 'customerId'])(
    'rejects spoofed %s',
    async (key) => {
      await expect(
        validate(CreateBookingDto, { ...create, [key]: actor.id }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
  it.each([
    { date: '2026-02-30' },
    { date: '2026-12-31T18:30:00Z' },
    { slot: '25:00' },
    { partySize: 0 },
    { partySize: 1.5 },
  ])('rejects malformed time/party shape %j', async (extra) => {
    await expect(
      validate(CreateBookingDto, { ...create, ...extra }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('requires manual guest contact and reason', async () => {
    await expect(
      validate(ManualBookingDto, {
        date: create.date,
        slot: create.slot,
        partySize: 2,
        reason: 'Walk in',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('requires owner contact evidence', async () => {
    await expect(
      validate(OwnerChangeDto, { reason: 'Customer request' }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('limits correction transport to the accepted status pair', async () => {
    await expect(
      validate(CorrectOutcomeDto, {
        status: 'CONFIRMED',
        reason: 'Correction',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('parses list pagination without choosing an ownership scope from body', async () => {
    await expect(
      validate(BookingListDto, { page: '2', limit: '10' }),
    ).resolves.toMatchObject({ page: 2, limit: 10 });
  });
  it('rejects a malformed hold timestamp', async () => {
    await expect(
      validate(ExtendHoldDto, { holdUntil: 'tomorrow', reason: 'Requested' }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('keeps the idempotency key opaque', () => {
    expect(bookingKey('abc')).toBe('abc');
    expect(() => bookingKey(' ')).toThrow();
  });
  it('does not call persistence while business logic is pending', async () => {
    const repo = new PendingBookingRepository();
    const spy = vi.spyOn(repo, 'createAtomic');
    const service = new BookingsService(repo);
    await expect(
      service.create({ actor, idempotencyKey: 'key' }, create),
    ).rejects.toBeInstanceOf(NotImplementedException);
    expect(spy).not.toHaveBeenCalled();
  });
});
