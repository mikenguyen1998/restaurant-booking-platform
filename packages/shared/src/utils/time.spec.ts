import { describe, expect, it } from 'vitest';
import { generateSlots, intervalsOverlap, toMinutes, toTime } from './time.js';

describe('toMinutes', () => {
  it('converts HH:mm to minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('17:30')).toBe(1050);
    expect(toMinutes('23:59')).toBe(1439);
  });
});

describe('toTime', () => {
  it('converts minutes to zero-padded HH:mm', () => {
    expect(toTime(0)).toBe('00:00');
    expect(toTime(545)).toBe('09:05');
    expect(toTime(1050)).toBe('17:30');
  });

  it('round-trips with toMinutes', () => {
    expect(toTime(toMinutes('18:45'))).toBe('18:45');
  });
});

describe('generateSlots', () => {
  it('generates slots every interval while the full booking fits before closing', () => {
    expect(generateSlots('17:00', '22:00', 30, 120)).toEqual([
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
    ]);
  });

  it('includes a slot whose booking ends exactly at closing time', () => {
    expect(generateSlots('18:00', '20:00', 60, 120)).toEqual(['18:00']);
  });

  it('supports a 15-minute interval', () => {
    expect(generateSlots('18:00', '19:30', 15, 60)).toEqual([
      '18:00',
      '18:15',
      '18:30',
    ]);
  });

  it('returns no slots when the opening period is shorter than the booking', () => {
    expect(generateSlots('18:00', '19:00', 30, 120)).toEqual([]);
  });
});

describe('intervalsOverlap', () => {
  const at = (time: string) => new Date(`2026-10-10T${time}:00+07:00`);

  // Domain example: existing booking 18:00–20:00 + 15 min buffer → occupied [18:00, 20:15).
  const existingStart = at('18:00');
  const existingEnd = at('20:15');

  it('detects a booking starting inside the occupied window (20:00)', () => {
    expect(
      intervalsOverlap(existingStart, existingEnd, at('20:00'), at('22:15')),
    ).toBe(true);
  });

  it('allows a booking starting exactly when the window ends (20:15, half-open)', () => {
    expect(
      intervalsOverlap(existingStart, existingEnd, at('20:15'), at('22:30')),
    ).toBe(false);
  });

  it('detects a booking before whose buffer reaches the existing one (16:00 → 18:15)', () => {
    expect(
      intervalsOverlap(existingStart, existingEnd, at('16:00'), at('18:15')),
    ).toBe(true);
  });

  it('detects a window fully containing another', () => {
    expect(
      intervalsOverlap(existingStart, existingEnd, at('17:00'), at('23:00')),
    ).toBe(true);
  });
});
