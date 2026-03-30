import { apiClient } from "./client.ts";

export interface FigureResponse {
  id: string;
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  birthYear: string;
  deathYear: string;
  isPublished: boolean;
  isFeatured: boolean;
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

export const figuresApi = {
  getAll: async (params?: {
    isPublished?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<FigureResponse>>("/figures", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: FigureResponse }>(`/figures/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await apiClient.get<FigureResponse[]>("/figures/featured");
    return response.data;
  },

  create: async (data: {
    adminId: number;
    name: string;
    title?: string;
    bio?: string;
    imageUrl?: string;
    birthYear?: string;
    deathYear?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await apiClient.post<FigureResponse>("/figures", data);
    return response.data;
  },

  update: async (id: string, data: {
    name: string;
    title?: string;
    bio?: string;
    imageUrl?: string;
    birthYear?: string;
    deathYear?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await apiClient.put<FigureResponse>(`/figures/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/figures/${id}`);
  },
};