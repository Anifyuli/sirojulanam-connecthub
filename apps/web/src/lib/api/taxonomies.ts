import { apiClient } from "./client";

export interface Category {
  id: number;
  name: string;
  slug: string;
  colorHex: string | null;
  itemCount: number;
  type: "event" | "blog" | "video";
}

export interface Tag {
  tag: string;
  count: number;
  type: "event" | "blog" | "video";
}

export const taxonomyService = {
  async getCategories(type: "event" | "blog" | "video"): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`/taxonomies/${type}/categories`);
    return response.data;
  },

  async getCategoryById(type: "event" | "blog" | "video", id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/taxonomies/${type}/categories/${id}`);
    return response.data;
  },

  async createCategory(type: "event" | "blog" | "video", data: { name: string; slug: string; colorHex?: string }): Promise<Category> {
    const response = await apiClient.post<Category>(`/taxonomies/${type}/categories`, data);
    return response.data;
  },

  async updateCategory(type: "event" | "blog" | "video", id: number, data: { name?: string; slug?: string; colorHex?: string }): Promise<Category> {
    const response = await apiClient.put<Category>(`/taxonomies/${type}/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(type: "event" | "blog" | "video", id: number): Promise<void> {
    await apiClient.delete(`/taxonomies/${type}/categories/${id}`);
  },

  async getTags(type: "event" | "blog" | "video"): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>(`/taxonomies/${type}/tags`);
    return response.data;
  },

  async deleteTag(type: "event" | "blog" | "video", tag: string): Promise<void> {
    await apiClient.delete(`/taxonomies/${type}/tags/${encodeURIComponent(tag)}`);
  },
};
