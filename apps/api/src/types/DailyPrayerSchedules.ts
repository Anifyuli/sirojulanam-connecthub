import { PrayTime } from "../entities/DailyPrayerSchedule.ts";

export interface CreateDailyPrayerScheduleDto {
  prayTime: PrayTime;
  imam: string;
}

export interface UpdateDailyPrayerScheduleDto {
  prayTime?: PrayTime;
  imam?: string;
}

export interface DailyPrayerScheduleResponse {
  prayTime: PrayTime;
  imam: string;
}
