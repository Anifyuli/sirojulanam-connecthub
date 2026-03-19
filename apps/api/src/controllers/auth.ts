import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { AdminService } from '../services/admins.ts';

export class AuthController {
  private readonly service: AdminService;

  constructor(em: EntityManager) {
    this.service = new AdminService(em);
  }

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = res.locals.admin;

      if (!admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const adminData = await this.service.findById(admin.id);

      if (!adminData || !adminData.isActive) {
        res.status(401).json({
          success: false,
          code: "USER_INACTIVE",
          message: "Akun tidak ditemukan atau sudah dinonaktifkan.",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: adminData.id,
            username: adminData.username,
            name: adminData.name,
            email: adminData.email,
            roleId: adminData.roleId,
            isActive: adminData.isActive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
