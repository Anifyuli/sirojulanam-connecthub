import { EntityManager } from "@mikro-orm/core";
import { DailyPrayerSchedule, PrayTime } from "../entities/DailyPrayerSchedule.js";
import {
  CreateDailyPrayerScheduleDto,
  UpdateDailyPrayerScheduleDto,
  DailyPrayerScheduleResponse,
} from "../types/DailyPrayerSchedules.js";

export class DailyPrayerScheduleService {
  constructor(private readonly em: EntityManager) { }

  private mapToResponse(schedule: DailyPrayerSchedule): DailyPrayerScheduleResponse {
    return {
      prayTime: schedule.prayTime,
      imam: schedule.imam,
    };
  }

  async findAll(): Promise<DailyPrayerScheduleResponse[]> {
    const schedules = await this.em.find(DailyPrayerSchedule, {});
    return schedules.map((schedule) => this.mapToResponse(schedule));
  }

  async findByPrayTime(prayTime: PrayTime): Promise<DailyPrayerScheduleResponse | null> {
    const schedule = await this.em.findOne(DailyPrayerSchedule, { prayTime });

    if (!schedule) {
      return null;
    }

    return this.mapToResponse(schedule);
  }

  async upsert(data: CreateDailyPrayerScheduleDto): Promise<DailyPrayerScheduleResponse> {
    const existing = await this.em.findOne(DailyPrayerSchedule, { prayTime: data.prayTime });

    if (existing) {
      // Update
      existing.imam = data.imam;
      await this.em.flush();
      return this.mapToResponse(existing);
    } else {
      // Create
      const schedule = new DailyPrayerSchedule();
      schedule.prayTime = data.prayTime;
      schedule.imam = data.imam;

      this.em.persist(schedule);
      await this.em.flush();

      return this.mapToResponse(schedule);
    }
  }

  async update(prayTime: PrayTime, data: UpdateDailyPrayerScheduleDto): Promise<DailyPrayerScheduleResponse | null> {
    const schedule = await this.em.findOne(DailyPrayerSchedule, { prayTime });

    if (!schedule) {
      return null;
    }

    if (data.imam !== undefined) {
      schedule.imam = data.imam;
    }

    await this.em.flush();

    return this.mapToResponse(schedule);
  }

  async delete(prayTime: PrayTime): Promise<boolean> {
    const schedule = await this.em.findOne(DailyPrayerSchedule, { prayTime });

    if (!schedule) {
      return false;
    }

    this.em.remove(schedule);
    await this.em.flush();
    return true;
  }
}
