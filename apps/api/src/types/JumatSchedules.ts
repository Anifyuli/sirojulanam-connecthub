import { JumatSchedulesPasaran } from "../entities/JumatSchedules.ts";

export interface CreateJumatSchedulesDto {
  pasaran: JumatSchedulesPasaran;
  imam: string;
  khotib: string;
  bilal: string;
}

export interface UpdateJumatScheduleDto {
  pasaran?: JumatSchedulesPasaran;
  imam?: string;
  khotib?: string;
  bilal?: string;
}

export interface JumatScheduleResponse {
  pasaran: JumatSchedulesPasaran;
  imam: string;
  khotib: string;
  bilal: string;
}
