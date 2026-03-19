import { apiClient } from "./client";

export interface Event {
  id: number;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  isPublished: boolean;
  authorId: number | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
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

export interface EventsResponse {
  data: Event[];
  pagination: PaginationInfo;
}

export const eventsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
    upcoming?: boolean;
  }): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
    if (params?.upcoming) searchParams.set("upcoming", "true");
    
    const query = searchParams.toString();
    const response = await apiClient.get<EventsResponse>(`/events${query ? `?${query}` : ""}`);
    return response.data;
  },

  async getById(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/slug/${slug}`);
    return response.data;
  },

  async getByCategory(categoryId: number): Promise<EventsResponse> {
    const response = await apiClient.get<EventsResponse>(`/events/category/${categoryId}`);
    return response.data;
  },
};