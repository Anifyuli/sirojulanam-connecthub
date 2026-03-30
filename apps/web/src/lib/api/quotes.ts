import { apiClient } from "./client.ts";

export interface QuoteResponse {
  id: string;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
    colorHex?: string;
  };
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  content: string;
  source: string;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const quotesApi = {
  getAll: async (params?: {
    categoryId?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<QuoteResponse>>("/quotes", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: QuoteResponse }>(`/quotes/${id}`);
    return response.data;
  },

  getRandom: async () => {
    const response = await apiClient.get<{ success: boolean; data: QuoteResponse }>("/quotes/random");
    return response.data;
  },

  create: async (data: {
    adminId: number;
    content: string;
    categoryId?: number;
    source?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await apiClient.post<QuoteResponse>("/quotes", data);
    return response.data;
  },

  update: async (id: string, data: {
    content: string;
    categoryId?: number;
    source?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await apiClient.put<QuoteResponse>(`/quotes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/quotes/${id}`);
  },

  getCategories: async () => {
    const response = await apiClient.get<Array<{
      id: number;
      name: string;
      slug: string;
      colorHex: string;
      createdAt: string;
    }>>("/quotes/categories/all");
    return response.data;
  },

  createCategory: async (data: { name: string; slug: string; colorHex?: string }) => {
    const response = await apiClient.post("/quotes/categories", data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await apiClient.delete(`/quotes/categories/${id}`);
  },
};