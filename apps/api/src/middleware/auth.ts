import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.ts";

function getToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return req.cookies?.accessToken;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  try {
    res.locals.admin = verifyAccessToken(token);
    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Token autentikasi tidak valid atau sudah kadaluarsa.",
    });
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);

  if (token) {
    try {
      res.locals.admin = verifyAccessToken(token);
    } catch {
      // Invalid token, but continue anyway (optional auth)
    }
  }

  next();
}
