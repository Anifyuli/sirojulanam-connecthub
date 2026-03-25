import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@mikro-orm/core', () => ({
  RequestContext: {
    getEntityManager: jest.fn(),
  },
  BlogPosts: class {},
  Videos: class {},
  Events: class {},
}));

jest.mock('../lib/jwt.ts', () => ({
  verifyAccessToken: jest.fn(),
}));

import { RequestContext } from '@mikro-orm/core';
import { authorizeOwnership, isManager, getAuthUser, AuthUser, checkOwnership } from './authorize.ts';

const mockEm: {
  findOne: jest.MockedFunction<any>;
  execute: jest.MockedFunction<any>;
} = {
  findOne: jest.fn(),
  execute: jest.fn(),
};

const mockGetEntityManager = RequestContext.getEntityManager as jest.MockedFunction<typeof RequestContext.getEntityManager>;

function createMockReqResNext() {
  const jsonFn = jest.fn().mockReturnThis();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const req: any = {
    params: { id: '1' },
  };
  const res: any = {
    status: statusFn,
    locals: {},
    json: jsonFn,
  };
  const next = jest.fn();

  return { req, res, next, statusFn, jsonFn };
}

describe('Authorization Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isManager', () => {
    it('should return true for manager role', () => {
      const user: AuthUser = { id: 1, username: 'admin', role: 'manager' };
      expect(isManager(user)).toBe(true);
    });

    it('should return false for editor role', () => {
      const user: AuthUser = { id: 2, username: 'editor', role: 'editor' };
      expect(isManager(user)).toBe(false);
    });
  });

  describe('getAuthUser', () => {
    it('should return admin from locals', () => {
      const user: AuthUser = { id: 1, username: 'admin', role: 'manager' };
      const res: any = { locals: { admin: user } };
      expect(getAuthUser(res)).toEqual(user);
    });

    it('should return undefined when no admin in locals', () => {
      const res: any = { locals: {} };
      expect(getAuthUser(res)).toBeUndefined();
    });
  });

  describe('checkOwnership', () => {
    it('should return true when user owns the resource', async () => {
      const mockResult = [{ admin_id: BigInt(1) }];
      mockEm.execute.mockResolvedValue(mockResult);

      const result = await checkOwnership(mockEm as any, 1, 1, 'blog');

      expect(result).toBe(true);
      expect(mockEm.execute).toHaveBeenCalled();
    });

    it('should return false when user does not own the resource', async () => {
      const mockResult = [{ admin_id: BigInt(2) }];
      mockEm.execute.mockResolvedValue(mockResult);

      const result = await checkOwnership(mockEm as any, 1, 1, 'blog');

      expect(result).toBe(false);
    });

    it('should return false when resource not found', async () => {
      mockEm.execute.mockResolvedValue([]);

      const result = await checkOwnership(mockEm as any, 999, 1, 'blog');

      expect(result).toBe(false);
    });
  });

  describe('authorizeOwnership middleware', () => {
    it('should return 401 when no user in locals', async () => {
      const { req, res, next } = createMockReqResNext();
      res.locals = {};

      const middleware = authorizeOwnership('blog');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next for manager without checking ownership', async () => {
      const { req, res, next } = createMockReqResNext();
      res.locals.admin = { id: 1, username: 'manager', role: 'manager' };

      const middleware = authorizeOwnership('blog');
      await middleware(req, res, next);

      expect(mockGetEntityManager).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when editor does not own the resource', async () => {
      mockGetEntityManager.mockReturnValue(mockEm as any);
      mockEm.findOne.mockResolvedValue({ admin: { id: BigInt(2) } } as any);

      const { req, res, next } = createMockReqResNext();
      res.locals.admin = { id: 1, username: 'editor', role: 'editor' };

      const middleware = authorizeOwnership('blog');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when editor owns the resource', async () => {
      mockGetEntityManager.mockReturnValue(mockEm as any);
      mockEm.execute.mockResolvedValue([{ admin_id: BigInt(1) }]);

      const { req, res, next } = createMockReqResNext();
      res.locals.admin = { id: 1, username: 'editor', role: 'editor' };

      const middleware = authorizeOwnership('blog');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for invalid resource ID', async () => {
      const { req, res, next } = createMockReqResNext();
      req.params.id = 'invalid';
      res.locals.admin = { id: 1, username: 'editor', role: 'editor' };

      const middleware = authorizeOwnership('blog');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});