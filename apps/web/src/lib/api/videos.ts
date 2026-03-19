import { apiClient } from "./client";

export interface Video {
  id: number;
  title: string;
  description: string;
  slug: string;
  thumbnail: string | null;
  embedUrl: string;
  sourcePlatform: "youtube" | "tiktok" | "instagram" | "facebook" | "other";
  sourceUrl: string;
  isPublished: boolean;
  authorId: number | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface VideosResponse {
  data: Video[];
  pagination: PaginationInfo;
}

export const videosService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
  }): Promise<VideosResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
    
    const query = searchParams.toString();
    const response = await apiClient.get<VideosResponse>(`/videos${query ? `?${query}` : ""}`);
    return response.data;
  },

  async getById(id: number): Promise<Video> {
    const response = await apiClient.get<Video>(`/videos/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<Video> {
    const response = await apiClient.get<Video>(`/videos/slug/${slug}`);
    return response.data;
  },

  async getByCategory(categoryId: number): Promise<VideosResponse> {
    const response = await apiClient.get<VideosResponse>(`/videos/category/${categoryId}`);
    return response.data;
  },
};