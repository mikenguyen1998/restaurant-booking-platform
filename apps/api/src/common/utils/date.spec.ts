import { describe, expect, it } from 'vitest';
import { formatDbTime, getDayOfWeek, toZonedDateTime } from './date.js';

describe('getDayOfWeek', () => {
  it('maps dates to the Prisma DayOfWeek values, including Sunday', () => {
    expect(getDayOfWeek('2026-10-10', 'Asia/Ho_Chi_Minh')).toBe('SATURDAY');
    expect(getDayOfWeek('2026-10-11', 'Asia/Ho_Chi_Minh')).toBe('SUNDAY');
    expect(getDayOfWeek('2026-10-12', 'Asia/Ho_Chi_Minh')).toBe('MONDAY');
  });

  it('uses the local date in the given timezone, not the server timezone', () => {
    expect(getDayOfWeek('2026-10-10', 'America/New_York')).toBe('SATURDAY');
  });
});

describe('toZonedDateTime', () => {
  it('interprets date + time in the restaurant timezone', () => {
    const dt = toZonedDateTime('2026-10-10', '19:00', 'Asia/Ho_Chi_Minh');

    expect(dt.toUTC().toISO()).toBe('2026-10-10T12:00:00.000Z');
  });
});

describe('formatDbTime', () => {
  it('extracts HH:mm from a Prisma @db.Time value', () => {
    expect(formatDbTime(new Date('1970-01-01T17:30:00.000Z'))).toBe('17:30');
  });
});
