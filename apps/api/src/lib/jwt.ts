import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("JWT_SECRET must be defined");

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function signAccessToken(payload: { id: number; username: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: { id: number }): string {
  return jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyAccessToken(token: string): { id: number; username: string; role: string } {
  const decoded = jwt.verify(token, SECRET);
  return decoded as { id: number; username: string; role: string };
}

export function verifyRefreshToken(token: string): { id: number } {
  const decoded = jwt.verify(token, SECRET);
  return decoded as { id: number };
}
