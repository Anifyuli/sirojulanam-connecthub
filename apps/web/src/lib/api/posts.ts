import { apiClient } from "./client.ts";

export type PostType = "opinion" | "quote_of_day" | "figure_spotlight";

export interface ReactionSummary {
  reactionType: string;
  count: number;
}

export interface PostResponse {
  id: string;
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  type: PostType;
  title?: string;
  content: string;
  tags?: string[];
  quoteId?: string;
  quote?: {
    id: string;
    content: string;
    source: string;
  };
  figureId?: string;
  figure?: {
    id: string;
    name: string;
    title: string;
    imageUrl: string;
  };
  isPublished: boolean;
  viewCount: number;
  reactions: ReactionSummary[];
  reactionCount: number;
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

export const postsApi = {
  getAll: async (params?: {
    type?: PostType;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<PostResponse>>("/posts", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: PostResponse }>(`/posts/${id}`);
    return response.data;
  },

  create: async (data: {
    adminId: number;
    type: PostType;
    content: string;
    quoteId?: string;
    figureId?: string;
    isPublished?: boolean;
  }) => {
    const response = await apiClient.post<PostResponse>("/posts", data);
    return response.data;
  },

  update: async (id: string, data: {
    type?: PostType;
    content?: string;
    quoteId?: string;
    figureId?: string;
    isPublished?: boolean;
  }) => {
    const response = await apiClient.put<PostResponse>(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/posts/${id}`);
  },

  addReaction: async (id: string, data: { adminId: number; reactionType: string }) => {
    await apiClient.post(`/posts/${id}/reactions`, data);
  },
};