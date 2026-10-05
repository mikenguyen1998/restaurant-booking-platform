// Index 0 = Sunday … 6 = Saturday (same as Date#getDay()). Values match the Prisma `DayOfWeek` enum.
export const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
