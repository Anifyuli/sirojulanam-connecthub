import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { AdminService } from '../services/admins';
import { AuthService } from '../services/auth';
import { CreateAdminDto, UpdateAdminDto, RegisterDto } from '../types/Admin';

export class AdminController {
  private readonly service: AdminService;
  private readonly authService: AuthService;

  constructor(em: EntityManager) {
    this.service = new AdminService(em);
    this.authService = new AuthService(em);
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(400).json({
          success: false,
          code: "NO_REFRESH_TOKEN",
          message: "Refresh token tidak ditemukan. Silakan login ulang.",
        });
        return;
      }

      const result = await this.authService.refresh(refreshToken);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          code: "REFRESH_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const _adminId = res.locals.admin.id;

      if (refreshToken) {
        await this.authService.revoke(refreshToken);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Berhasil logout.',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          code: "LOGOUT_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = res.locals.admin.id;

      await this.authService.revokeAll(adminId);

      res.json({
        success: true,
        message: 'Berhasil logout dari semua perangkat.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, username, password, rememberMe } = req.body;

      if ((!email && !username) || !password) {
        res.status(400).json({
          success: false,
          code: "MISSING_CREDENTIALS",
          message: "Email/username dan password wajib diisi.",
        });
        return;
      }

      const result = await this.service.login(email || '', username || '', password, rememberMe === true);

      const isPersistent = rememberMe === true;
      
      // Access token cookie
      const accessCookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };
      if (isPersistent) {
        accessCookieOptions.maxAge = 15 * 60 * 1000; // 15 min if rememberMe
      }
      // Without rememberMe: session cookie (deleted when browser closes)
      
      // Refresh token cookie
      const refreshCookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };
      if (isPersistent) {
        refreshCookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days if rememberMe
      }
      // Without rememberMe: session cookie
      
      res.cookie('accessToken', result.accessToken, accessCookieOptions);
      res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          code: "LOGIN_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, email, password } = req.body as RegisterDto;

      if (!name || !username || !email || !password) {
        res.status(400).json({
          success: false,
          code: "MISSING_FIELDS",
          message: "Nama, username, email, dan password wajib diisi.",
        });
        return;
      }

      if (username.length < 3) {
        res.status(400).json({
          success: false,
          code: "USERNAME_TOO_SHORT",
          message: "Username minimal 3 karakter.",
        });
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        res.status(400).json({
          success: false,
          code: "INVALID_USERNAME",
          message: "Username hanya boleh mengandung huruf, angka, dan underscore.",
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          success: false,
          code: "PASSWORD_TOO_SHORT",
          message: "Password minimal 8 karakter.",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          code: "INVALID_EMAIL",
          message: "Format email tidak valid.",
        });
        return;
      }

      const result = await this.service.register({ name, username, email, password });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          code: "REGISTER_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, username, isActive, roleId, page, limit } = req.query;
      const filter: any = {};

      if (name) filter.name = name as string;
      if (email) filter.email = email as string;
      if (username) filter.username = username as string;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (roleId) filter.roleId = parseInt(roleId as string, 10);

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await this.service.find(filter, pagination);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
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
      const { name, username, email, passwordHash, roleId } = req.body as CreateAdminDto;

      if (!name || !username || !email || !passwordHash || !roleId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
        return;
      }

      const admin = await this.service.create({ name, username, email, passwordHash, roleId });

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

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = res.locals.admin.id;
      const { name, email, username, currentPassword, newPassword } = req.body;

      const admin = await this.service.updateProfile(adminId, {
        name,
        email,
        username,
        currentPassword,
        newPassword,
      });

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
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
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
