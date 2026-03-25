import { apiClient } from "./client";

export interface JumatSchedule {
  pasaran: string;
  imam: string;
  khotib: string;
  bilal: string;
}

export interface ResponseWithTotal<T> {
  success: boolean;
  data: T[];
  total?: number;
}

export const jumatSchedulesService = {
  async getAll(): Promise<ResponseWithTotal<JumatSchedule>> {
    const response = await apiClient.get<ResponseWithTotal<JumatSchedule>>("/jumat-schedules");
    return response.data;
  },

  async getByPasaran(pasaran: string): Promise<JumatSchedule> {
    const response = await apiClient.get<{ success: boolean; data: JumatSchedule }>(`/jumat-schedules/${pasaran}`);
    return response.data.data;
  },
};