import { apiClient } from "./client";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  coverImageUrl: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt: string;
  viewCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  admin?: {
    id: number;
    name: string;
  };
}

export interface BlogCategory {
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

export interface BlogsResponse {
  data: BlogPost[];
  pagination: PaginationInfo;
}

export const blogsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
  }): Promise<BlogsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
    
    const query = searchParams.toString();
    const response = await apiClient.get<BlogsResponse>(`/blogs${query ? `?${query}` : ""}`);
    return response.data;
  },

  async getById(id: number): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/blogs/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/blogs/slug/${slug}`);
    return response.data;
  },

  async getByCategory(categoryId: number): Promise<BlogsResponse> {
    const response = await apiClient.get<BlogsResponse>(`/blogs/category/${categoryId}`);
    return response.data;
  },
};