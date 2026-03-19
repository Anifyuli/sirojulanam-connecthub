import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { PrayerTimesService } from '../services/prayerTimes.ts';

export class PrayerTimesController {
  private readonly service: PrayerTimesService;

  constructor(em: EntityManager) {
    this.service = new PrayerTimesService(em);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, city, startDate, endDate } = req.query;
      const filter: any = {};

      if (date) filter.date = date as string;
      if (city) filter.city = city as string;
      if (startDate) filter.startDate = startDate as string;
      if (endDate) filter.endDate = endDate as string;

      const prayerTimes = await this.service.find(filter);
      res.json({ data: prayerTimes });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }

      const prayerTime = await this.service.findById(id);

      if (!prayerTime) {
        res.status(404).json({
          success: false,
          error: 'Prayer time not found',
        });
        return;
      }

      res.json({
        success: true,
        data: prayerTime,
      });
    } catch (error) {
      next(error);
    }
  };

  getByDateAndCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, city } = req.params;

      if (!date || !city || Array.isArray(date) || Array.isArray(city)) {
        res.status(400).json({
          success: false,
          error: 'Missing required params: date and city',
        });
        return;
      }

      const prayerTime = await this.service.findByDateAndCity(date, city);

      if (!prayerTime) {
        res.status(404).json({
          success: false,
          error: 'Prayer time not found',
        });
        return;
      }

      res.json({
        success: true,
        data: prayerTime,
      });
    } catch (error) {
      next(error);
    }
  };

  fetchFromEquranId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { province, city, month, year } = req.body;

      if (!province || !city || !month || !year) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: province, city, month, year',
        });
        return;
      }

      const prayerTimes = await this.service.fetchAndSaveFromEquranId(
        province,
        city,
        parseInt(month, 10),
        parseInt(year, 10)
      );

      res.status(201).json({
        success: true,
        data: prayerTimes,
      });
    } catch (error) {
      next(error);
    }
  };

  upsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const prayerTime = await this.service.upsert(data);

      res.status(201).json({
        success: true,
        data: prayerTime,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Prayer time not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  deleteByDateAndCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, city } = req.params;

      if (!date || !city || Array.isArray(date) || Array.isArray(city)) {
        res.status(400).json({
          success: false,
          error: 'Missing required params: date and city',
        });
        return;
      }

      const deleted = await this.service.deleteByDateAndCity(date, city);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Prayer time not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
