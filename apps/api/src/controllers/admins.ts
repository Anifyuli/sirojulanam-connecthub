import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { AdminService, CreateAdminDto, UpdateAdminDto } from '../services/admins.js';

export class AdminController {
  private readonly service: AdminService;

  constructor(em: EntityManager) {
    this.service = new AdminService(em);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await this.service.findAll();
      res.json({
        success: true,
        data: admins,
      });
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
          error: 'Invalid admin ID',
        });
        return;
      }

      const admin = await this.service.findById(id);

      if (!admin) {
        res.status(404).json({
          success: false,
          error: 'Admin not found',
        });
        return;
      }

      res.json({
        success: true,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, passwordHash, roleId } = req.body as CreateAdminDto;

      if (!name || !email || !passwordHash || !roleId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
        return;
      }

      const admin = await this.service.create({ name, email, passwordHash, roleId });

      res.status(201).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid admin ID',
        });
        return;
      }

      const data = req.body as UpdateAdminDto;
      const admin = await this.service.update(id, data);

      if (!admin) {
        res.status(404).json({
          success: false,
          error: 'Admin not found',
        });
        return;
      }

      res.json({
        success: true,
        data: admin,
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
          error: 'Invalid admin ID',
        });
        return;
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Admin not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
