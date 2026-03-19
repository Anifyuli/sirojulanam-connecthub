import { apiClient } from "./client";

export interface JumatSchedule {
  id: number;
  date: string;
  imam: string;
  khotbah: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseWithTotal<T> {
  data: T[];
  total: number;
}

export const jumatSchedulesService = {
  async getAll(): Promise<ResponseWithTotal<JumatSchedule>> {
    const response = await apiClient.get<ResponseWithTotal<JumatSchedule>>("/jumat-schedules");
    return response.data;
  },

  async getByPasaran(pasaran: string): Promise<JumatSchedule> {
    const response = await apiClient.get<JumatSchedule>(`/jumat-schedules/${pasaran}`);
    return response.data;
  },
};