import { apiClient } from "./client";

export interface DailyPrayerSchedule {
  prayTime: string;
  imam: string;
}

export const dailyPrayerSchedulesService = {
  async getAll(): Promise<DailyPrayerSchedule[]> {
    const response = await apiClient.get<{ success: boolean; data: DailyPrayerSchedule[] }>("/daily-prayer-schedules");
    return response.data.data;
  },
};
