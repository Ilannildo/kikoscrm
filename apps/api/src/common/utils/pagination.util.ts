export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
}

export function getSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

type SortDirection = 'asc' | 'desc';

export function parseSortParam(
  sort: string | undefined,
  allowedFields: readonly string[],
  defaultField: string,
): Record<string, SortDirection> {
  if (!sort) {
    return { [defaultField]: 'desc' };
  }

  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;

  if (!allowedFields.includes(field)) {
    return { [defaultField]: 'desc' };
  }

  return { [field]: desc ? 'desc' : 'asc' };
}
