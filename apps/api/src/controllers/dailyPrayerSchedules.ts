import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { DailyPrayerScheduleService } from "../services/dailyPrayerSchedules.ts";
import { CreateDailyPrayerScheduleDto, UpdateDailyPrayerScheduleDto } from "../types/DailyPrayerSchedules.ts";
import { PrayTime } from "../entities/DailyPrayerSchedule.ts";

export class DailyPrayerScheduleController {
  private readonly service: DailyPrayerScheduleService;

  constructor(em: EntityManager) {
    this.service = new DailyPrayerScheduleService(em);
  }

  private isValidPrayTime(prayTime: string): prayTime is PrayTime {
    return Object.values(PrayTime).includes(prayTime as PrayTime);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schedules = await this.service.findAll();

      res.json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      next(error);
    }
  };

  getByPrayTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prayTime: _prayTime } = req.params;

      if (!_prayTime || Array.isArray(_prayTime) || !this.isValidPrayTime(_prayTime)) {
        res.status(400).json({
          success: false,
          error: `Invalid prayTime. Must be one of: ${Object.values(PrayTime).join(", ")}`,
        });
        return;
      }

      const schedule = await this.service.findByPrayTime(_prayTime as PrayTime);

      if (!schedule) {
        res.status(404).json({
          success: false,
          error: "Schedule not found",
        });
        return;
      }

      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateDailyPrayerScheduleDto = req.body;

      if (!data.prayTime || !this.isValidPrayTime(data.prayTime)) {
        res.status(400).json({
          success: false,
          error: `Invalid prayTime. Must be one of: ${Object.values(PrayTime).join(", ")}`,
        });
        return;
      }

      if (!data.imam || typeof data.imam !== "string") {
        res.status(400).json({
          success: false,
          error: "Imam is required",
        });
        return;
      }

      const schedule = await this.service.upsert(data);

      res.status(201).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prayTime } = req.params;
      const data: UpdateDailyPrayerScheduleDto = req.body;

      if (!prayTime || Array.isArray(prayTime) || !this.isValidPrayTime(prayTime)) {
        res.status(400).json({
          success: false,
          error: `Invalid prayTime. Must be one of: ${Object.values(PrayTime).join(", ")}`,
        });
        return;
      }

      const schedule = await this.service.update(prayTime as PrayTime, data);

      if (!schedule) {
        res.status(404).json({
          success: false,
          error: "Schedule not found",
        });
        return;
      }

      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prayTime } = req.params;

      if (!prayTime || Array.isArray(prayTime) || !this.isValidPrayTime(prayTime)) {
        res.status(400).json({
          success: false,
          error: `Invalid prayTime. Must be one of: ${Object.values(PrayTime).join(", ")}`,
        });
        return;
      }

      const deleted = await this.service.delete(prayTime as PrayTime);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Schedule not found",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
