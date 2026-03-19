import { apiClient } from "./client";

export interface PrayerTime {
  id: number;
  date: string;
  city: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  sunrise: string;
  dhuha: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PrayerTimesResponse {
  data: PrayerTime[];
  pagination: PaginationInfo;
}

export const prayerTimesService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PrayerTimesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.city) searchParams.set("city", params.city);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    
    const query = searchParams.toString();
    const response = await apiClient.get<PrayerTimesResponse>(`/prayer-times${query ? `?${query}` : ""}`);
    return response.data;
  },

  async getById(id: number): Promise<PrayerTime> {
    const response = await apiClient.get<PrayerTime>(`/prayer-times/${id}`);
    return response.data;
  },

  async getByDateAndCity(date: string, city: string): Promise<PrayerTime> {
    const response = await apiClient.get<PrayerTime>(`/prayer-times/date/${date}/city/${city}`);
    return response.data;
  },
};