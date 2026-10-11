// Candidate building and ranking for table allocation.
// Pure functions: no NestJS, no Prisma, no clock — see docs/domain/availability-and-allocation.md.

export interface TableInfo {
  id: string;
  capacity: number;
  priority: number;
  isActive: boolean;
}

export interface CombinationInfo {
  id: string;
  priority: number;
  tables: TableInfo[];
}

/** A set of tables that may serve one booking: a single table or an owner-defined combination. */
export interface Candidate {
  kind: 'single' | 'combination';
  id: string;
  resourceIds: string[];
  capacity: number;
  priority: number;
}

/**
 * Every candidate that can seat `partySize`:
 * - each active table with enough capacity;
 * - each combination whose members are all active and whose summed capacity is enough
 *   (capacity = sum of members until Q-13 decides otherwise).
 */
export function buildCandidates(
  tables: TableInfo[],
  combinations: CombinationInfo[],
  partySize: number,
): Candidate[] {
  const singles: Candidate[] = tables
    .filter((t) => t.isActive && t.capacity >= partySize)
    .map((t) => ({
      kind: 'single',
      id: t.id,
      resourceIds: [t.id],
      capacity: t.capacity,
      priority: t.priority,
    }));

  const combos: Candidate[] = combinations
    .filter((c) => c.tables.length > 0 && c.tables.every((t) => t.isActive))
    .map((c) => ({
      kind: 'combination' as const,
      id: c.id,
      resourceIds: c.tables.map((t) => t.id),
      capacity: c.tables.reduce((sum, t) => sum + t.capacity, 0),
      priority: c.priority,
    }))
    .filter((c) => c.capacity >= partySize);

  return [...singles, ...combos];
}

/**
 * Proposed ranking (Q-15): single before combination → best fit (least spare seats)
 * → higher priority → fewer tables → lowest id (deterministic).
 */
export function rankCandidates(
  candidates: Candidate[],
  partySize: number,
): Candidate[] {
  return [...candidates].sort(
    (a, b) =>
      Number(a.kind === 'combination') - Number(b.kind === 'combination') ||
      a.capacity - partySize - (b.capacity - partySize) ||
      b.priority - a.priority ||
      a.resourceIds.length - b.resourceIds.length ||
      a.id.localeCompare(b.id),
  );
}

/** First ranked candidate none of whose tables is busy, or null. */
export function pickFreeCandidate(
  ranked: Candidate[],
  busyIds: ReadonlySet<string>,
): Candidate | null {
  return (
    ranked.find((c) => c.resourceIds.every((id) => !busyIds.has(id))) ?? null
  );
}
