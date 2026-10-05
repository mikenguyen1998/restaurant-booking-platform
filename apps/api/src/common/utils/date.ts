import { DAYS_OF_WEEK, type DayOfWeek } from '@restaurant-platform/shared';
import { DateTime } from 'luxon';

/** Weekday of a local date ("2026-10-10") in the given IANA timezone. */
export function getDayOfWeek(date: string, timezone: string): DayOfWeek {
  // Luxon weekday: 1 = Monday … 7 = Sunday; `% 7` maps Sunday to index 0.
  return DAYS_OF_WEEK[DateTime.fromISO(date, { zone: timezone }).weekday % 7]!;
}

/** Local date + "HH:mm" in the given timezone → instant. */
export function toZonedDateTime(
  date: string,
  time: string,
  timezone: string,
): DateTime {
  return DateTime.fromISO(`${date}T${time}`, { zone: timezone });
}

/** Prisma `@db.Time` column (Date on 1970-01-01 UTC) → "HH:mm". */
export function formatDbTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}
