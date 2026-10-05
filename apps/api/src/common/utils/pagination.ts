export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(DEFAULT_PAGE, page ?? DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit ?? DEFAULT_LIMIT));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
