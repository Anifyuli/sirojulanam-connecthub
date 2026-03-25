import { describe, it, expect } from '@jest/globals';
import { PaginationParams, PaginatedResponse } from '../types/pagination.ts';

describe('Pagination Types', () => {
  it('should have correct PaginationParams structure', () => {
    const params: PaginationParams = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    expect(params.page).toBe(1);
    expect(params.limit).toBe(10);
    expect(params.sortBy).toBe('createdAt');
    expect(params.sortOrder).toBe('DESC');
  });

  it('should allow optional fields in PaginationParams', () => {
    const params: PaginationParams = {};

    expect(params.page).toBeUndefined();
    expect(params.limit).toBeUndefined();
    expect(params.sortBy).toBeUndefined();
    expect(params.sortOrder).toBeUndefined();
  });

  it('should have correct PaginatedResponse structure', () => {
    const response: PaginatedResponse<{ id: number }> = {
      data: [{ id: 1 }, { id: 2 }],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    expect(response.data).toHaveLength(2);
    expect(response.pagination.total).toBe(2);
    expect(response.pagination.hasNext).toBe(false);
  });
});
