import { describe, expect, it } from 'vitest';
import {
  buildCandidates,
  pickFreeCandidate,
  rankCandidates,
  type CombinationInfo,
  type TableInfo,
} from './allocation.js';

const table = (
  id: string,
  capacity: number,
  priority = 0,
  isActive = true,
): TableInfo => ({ id, capacity, priority, isActive });

const combo = (
  id: string,
  tables: TableInfo[],
  priority = 0,
): CombinationInfo => ({ id, priority, tables });

describe('buildCandidates', () => {
  it('keeps active single tables with enough capacity', () => {
    const result = buildCandidates(
      [table('t2', 2), table('t4', 4), table('t6-off', 6, 0, false)],
      [],
      3,
    );

    expect(result.map((c) => c.id)).toEqual(['t4']);
  });

  it('adds a combination whose summed capacity seats the party', () => {
    const result = buildCandidates(
      [table('t2a', 2), table('t2b', 2)],
      [combo('c-2+2', [table('t2a', 2), table('t2b', 2)])],
      4,
    );

    expect(result).toEqual([
      {
        kind: 'combination',
        id: 'c-2+2',
        resourceIds: ['t2a', 't2b'],
        capacity: 4,
        priority: 0,
      },
    ]);
  });

  it('drops a combination that is too small', () => {
    const result = buildCandidates(
      [],
      [combo('c-2+2', [table('a', 2), table('b', 2)])],
      5,
    );

    expect(result).toEqual([]);
  });

  it('drops a combination with an inactive member', () => {
    const result = buildCandidates(
      [],
      [combo('c', [table('a', 4), table('b', 4, 0, false)])],
      6,
    );

    expect(result).toEqual([]);
  });

  it('drops an empty combination', () => {
    expect(buildCandidates([], [combo('empty', [])], 1)).toEqual([]);
  });
});

describe('rankCandidates', () => {
  const ids = (tables: TableInfo[], combos: CombinationInfo[], party: number) =>
    rankCandidates(buildCandidates(tables, combos, party), party).map(
      (c) => c.id,
    );

  it('prefers a single table over a combination, even a tighter one', () => {
    expect(
      ids(
        [table('t6', 6), table('a', 2), table('b', 2)],
        [combo('c-2+2', [table('a', 2), table('b', 2)])],
        4,
      ),
    ).toEqual(['t6', 'c-2+2']);
  });

  it('prefers the best fit (fewest spare seats)', () => {
    expect(
      ids([table('t8', 8), table('t4', 4), table('t6', 6)], [], 4),
    ).toEqual(['t4', 't6', 't8']);
  });

  it('breaks equal fit by higher priority', () => {
    expect(ids([table('low', 4, 1), table('high', 4, 5)], [], 4)).toEqual([
      'high',
      'low',
    ]);
  });

  it('prefers fewer tables between combinations of equal fit and priority', () => {
    const a = table('a', 2);
    const b = table('b', 2);
    const c = table('c', 2);
    const d = table('d', 4);
    expect(
      ids([], [combo('three', [a, b, c]), combo('two', [b, d])], 6),
    ).toEqual(['two', 'three']);
  });

  it('falls back to the lowest id so the order is deterministic', () => {
    expect(ids([table('b', 4), table('a', 4)], [], 4)).toEqual(['a', 'b']);
  });

  it('does not mutate the input', () => {
    const candidates = buildCandidates([table('b', 4), table('a', 4)], [], 4);
    rankCandidates(candidates, 4);

    expect(candidates.map((c) => c.id)).toEqual(['b', 'a']);
  });
});

describe('pickFreeCandidate', () => {
  const ranked = rankCandidates(
    buildCandidates(
      [table('t4', 4), table('a', 2), table('b', 2)],
      [combo('c-2+2', [table('a', 2), table('b', 2)])],
      4,
    ),
    4,
  );

  it('returns the best candidate when nothing is busy', () => {
    expect(pickFreeCandidate(ranked, new Set())?.id).toBe('t4');
  });

  it('falls back to a combination when the single table is busy', () => {
    expect(pickFreeCandidate(ranked, new Set(['t4']))?.id).toBe('c-2+2');
  });

  it('rejects a combination when any member table is busy', () => {
    expect(pickFreeCandidate(ranked, new Set(['t4', 'b']))).toBeNull();
  });
});
