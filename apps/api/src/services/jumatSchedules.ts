import { EntityManager } from "@mikro-orm/core";
import { JumatSchedules, JumatSchedulesPasaran } from "../entities/JumatSchedules.ts";
import {
  CreateJumatSchedulesDto,
  UpdateJumatScheduleDto,
  JumatScheduleResponse,
} from "../types/JumatSchedules.ts";

export class JumatScheduleService {
  constructor(private readonly em: EntityManager) { }

  private mapToResponse(jumat: JumatSchedules): JumatScheduleResponse {
    return {
      pasaran: jumat.pasaran,
      imam: jumat.imam,
      khotib: jumat.khotib,
      bilal: jumat.bilal,
    };
  }

  async findAll(): Promise<JumatScheduleResponse[]> {
    const schedules = await this.em.find(JumatSchedules, {});
    return schedules.map((schedule) => this.mapToResponse(schedule));
  }

  async create(data: CreateJumatSchedulesDto): Promise<JumatScheduleResponse> {
    const schedule = new JumatSchedules();
    schedule.pasaran = data.pasaran;
    schedule.imam = data.imam;
    schedule.khotib = data.khotib;
    schedule.bilal = data.bilal;

    this.em.persist(schedule);
    await this.em.flush();

    return this.mapToResponse(schedule);
  }

  async update(pasaran: JumatSchedulesPasaran, data: UpdateJumatScheduleDto): Promise<JumatScheduleResponse | null> {
    const schedule = await this.em.findOne(JumatSchedules, { pasaran });

    if (!schedule) {
      return null;
    }

    if (data.imam !== undefined) {
      schedule.imam = data.imam;
    }
    if (data.khotib !== undefined) {
      schedule.khotib = data.khotib;
    }
    if (data.bilal !== undefined) {
      schedule.bilal = data.bilal;
    }

    await this.em.flush();

    return this.mapToResponse(schedule);
  }

  async delete(pasaran: JumatSchedulesPasaran): Promise<boolean> {
    const schedule = await this.em.findOne(JumatSchedules, { pasaran });

    if (!schedule) {
      return false;
    }

    this.em.remove(schedule);
    await this.em.flush();
    return true;
  }
}
