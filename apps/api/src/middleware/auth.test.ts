import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { authMiddleware } from '../middleware/auth';

jest.mock('../lib/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

import { verifyAccessToken } from '../lib/jwt';

const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<typeof verifyAccessToken>;

function createMockReqResNext() {
  const jsonFn = jest.fn().mockReturnThis();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const req: any = {
    headers: {},
    cookies: {},
  };
  const res: any = {
    status: statusFn,
    locals: {},
  };
  const next = jest.fn();

  return { req, res, next, statusFn, jsonFn };
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no token is provided', () => {
    const { req, res, next } = createMockReqResNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept token from Authorization header', () => {
    const { req, res, next } = createMockReqResNext();
    const decoded = { id: 1, username: 'admin', role: 'manager' };

    req.headers.authorization = 'Bearer valid-token';
    mockVerifyAccessToken.mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token');
    expect(res.locals.admin).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it('should accept token from cookies', () => {
    const { req, res, next } = createMockReqResNext();
    const decoded = { id: 2, username: 'editor', role: 'editor' };

    req.cookies.accessToken = 'cookie-token';
    mockVerifyAccessToken.mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('cookie-token');
    expect(res.locals.admin).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it('should prefer Authorization header over cookie', () => {
    const { req, res, next } = createMockReqResNext();
    const decoded = { id: 1, username: 'admin', role: 'manager' };

    req.headers.authorization = 'Bearer header-token';
    req.cookies.accessToken = 'cookie-token';
    mockVerifyAccessToken.mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('header-token');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    const { req, res, next } = createMockReqResNext();

    req.headers.authorization = 'Bearer invalid-token';
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
