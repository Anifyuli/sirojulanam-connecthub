import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.ts";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

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
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Token autentikasi tidak valid atau sudah kadaluarsa.",
    });
  }
}
