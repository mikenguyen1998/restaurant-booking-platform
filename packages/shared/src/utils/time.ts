/** "17:30" → 1050 (minutes since midnight). */
export function toMinutes(time: string): number {
  const [hh, mm] = time.split(':');

  return Number(hh) * 60 + Number(mm);
}

/** 1050 → "17:30". */
export function toTime(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Bookable start times ("HH:mm") between `openTime` and `closeTime`,
 * every `intervalMin` minutes, where the whole booking (`durationMin`) fits before closing.
 */
export function generateSlots(
  openTime: string,
  closeTime: string,
  intervalMin: number,
  durationMin: number,
): string[] {
  const slots: string[] = [];
  const close = toMinutes(closeTime);
  let t = toMinutes(openTime);
  while (t + durationMin <= close) {
    slots.push(toTime(t));
    t += intervalMin;
  }
  return slots;
}

/** Half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap. */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
