import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { JumatScheduleService } from "../services/jumatSchedules.ts";
import { CreateJumatSchedulesDto, UpdateJumatScheduleDto } from "../types/JumatSchedules.ts";
import { JumatSchedulesPasaran } from "../entities/JumatSchedules.ts";

export class JumatScheduleController {
  private readonly service: JumatScheduleService;

  constructor(em: EntityManager) {
    this.service = new JumatScheduleService(em);
  }

  private isValidPasaran(pasaran: string): pasaran is JumatSchedulesPasaran {
    return Object.values(JumatSchedulesPasaran).includes(pasaran as JumatSchedulesPasaran);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Note: This service doesn't have a find method, returning all would need implementation
      res.json({
        success: true,
        data: [],
        message: "Use GET /:pasaran to get specific schedule",
      });
    } catch (error) {
      next(error);
    }
  };

  getByPasaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pasaran } = req.params;

      // Note: This service doesn't have a findById method, would need implementation
      res.status(501).json({
        success: false,
        error: "Not implemented",
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateJumatSchedulesDto = req.body;

      const schedule = await this.service.create(data);

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
      const { pasaran } = req.params;
      const data: UpdateJumatScheduleDto = req.body;

      if (!pasaran || Array.isArray(pasaran) || !this.isValidPasaran(pasaran)) {
        res.status(400).json({
          success: false,
          error: `Invalid pasaran. Must be one of: ${Object.values(JumatSchedulesPasaran).join(", ")}`,
        });
        return;
      }

      const schedule = await this.service.update(pasaran as JumatSchedulesPasaran, data);

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
      const { pasaran } = req.params;

      if (!pasaran || Array.isArray(pasaran) || !this.isValidPasaran(pasaran)) {
        res.status(400).json({
          success: false,
          error: `Invalid pasaran. Must be one of: ${Object.values(JumatSchedulesPasaran).join(", ")}`,
        });
        return;
      }

      const deleted = await this.service.delete(pasaran as JumatSchedulesPasaran);

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
