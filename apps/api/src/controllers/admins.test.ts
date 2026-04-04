import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AdminController } from '../controllers/admins';

jest.mock('../services/admins', () => ({
  AdminService: jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    register: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateProfile: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('../services/auth', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    refresh: jest.fn(),
    revoke: jest.fn(),
    revokeAll: jest.fn(),
  })),
}));

import { AdminService } from '../services/admins';
import { AuthService } from '../services/auth';

function createMockReqResNext(overrides: Partial<any> = {}) {
  const jsonFn = jest.fn().mockReturnThis();
  const sendFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn, send: sendFn });
  const cookieFn = jest.fn();

  const req: any = {
    body: {},
    params: {},
    query: {},
    cookies: {},
    ...overrides,
  };

  const res: any = {
    status: statusFn,
    json: jsonFn,
    cookie: cookieFn,
    clearCookie: jest.fn(),
    send: sendFn,
    locals: {},
  };

  const next = jest.fn();

  return { req, res, next, statusFn, jsonFn, cookieFn, sendFn };
}

describe('AdminController', () => {
  let controller: AdminController;
  let mockService: jest.Mocked<AdminService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockEm: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = {};
    controller = new AdminController(mockEm);
    mockService = (controller as any).service;
    mockAuthService = (controller as any).authService;
  });

  describe('login', () => {
    it('should return 400 when credentials are missing', async () => {
      const { req, res, next } = createMockReqResNext({ body: {} });

      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 when login fails', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { email: 'test@test.com', password: 'wrong' },
      });

      mockService.login.mockRejectedValue(new Error('Username/email atau password salah.'));

      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return success with cookies on successful login', async () => {
      const { req, res, next, cookieFn } = createMockReqResNext({
        body: { email: 'admin@test.com', password: 'correct' },
      });

      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        admin: { id: 1, name: 'Admin', username: 'admin', email: 'admin@test.com', role: 'manager', isActive: true },
      };

      mockService.login.mockResolvedValue(loginResult as any);

      await controller.login(req, res, next);

      expect(cookieFn).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: loginResult,
      });
    });
  });

  describe('register', () => {
    it('should return 400 when fields are missing', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { name: 'Test' },
      });

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when username is too short', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { name: 'Test', username: 'ab', email: 'test@test.com', password: 'password123' },
      });

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when email is invalid', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { name: 'Test', username: 'testuser', email: 'invalid-email', password: 'password123' },
      });

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when password is too short', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { name: 'Test', username: 'testuser', email: 'test@test.com', password: 'short' },
      });

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 201 on successful registration', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { name: 'Test', username: 'testuser', email: 'test@test.com', password: 'password123' },
      });

      const registerResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        admin: { id: 1, name: 'Test', username: 'testuser', email: 'test@test.com', role: 'editor' },
      };

      mockService.register.mockResolvedValue(registerResult as any);

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getById', () => {
    it('should return 400 for invalid ID', async () => {
      const { req, res, next } = createMockReqResNext({
        params: { id: 'abc' },
      });

      await controller.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when admin not found', async () => {
      const { req, res, next } = createMockReqResNext({
        params: { id: '999' },
      });

      mockService.findById.mockResolvedValue(null);

      await controller.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return admin when found', async () => {
      const { req, res, next } = createMockReqResNext({
        params: { id: '1' },
      });

      const admin = { id: 1, name: 'Admin', username: 'admin', email: 'admin@test.com', roleId: 1, isActive: true };
      mockService.findById.mockResolvedValue(admin as any);

      await controller.getById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: admin,
      });
    });
  });

  describe('delete', () => {
    it('should return 400 for invalid ID', async () => {
      const { req, res, next } = createMockReqResNext({
        params: { id: 'invalid' },
      });

      await controller.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when admin not found', async () => {
      const { req, res, next } = createMockReqResNext({
        params: { id: '999' },
      });

      mockService.delete.mockResolvedValue(false);

      await controller.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 204 on successful deletion', async () => {
      const { req, res, next, sendFn } = createMockReqResNext({
        params: { id: '1' },
      });

      mockService.delete.mockResolvedValue(true);

      await controller.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(sendFn).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return paginated admins', async () => {
      const { req, res, next } = createMockReqResNext({
        query: { page: '1', limit: '10' },
      });

      const result = {
        data: [{ id: 1, name: 'Admin' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };

      mockService.find.mockResolvedValue(result as any);

      await controller.getAll(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    });
  });

  describe('refresh', () => {
    it('should return 400 when no refresh token', async () => {
      const { req, res, next } = createMockReqResNext({ cookies: {} });

      await controller.refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should refresh token successfully', async () => {
      const { req, res, next, cookieFn } = createMockReqResNext({
        cookies: { refreshToken: 'valid-refresh-token' },
      });

      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'new-access-token',
        admin: { id: 1 },
      } as any);

      await controller.refresh(req, res, next);

      expect(cookieFn).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { refreshToken: 'some-token' },
      });

      res.locals.admin = { id: 1 };
      mockAuthService.revoke.mockResolvedValue(undefined);

      await controller.logout(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Berhasil logout.',
      });
    });
  });
});
