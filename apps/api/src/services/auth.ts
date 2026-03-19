import { verifyRefreshToken, signAccessToken } from "../lib/jwt.ts";
import { EntityManager } from "@mikro-orm/core";
import { Admins } from "../entities/Admins.ts";
import { RefreshTokens } from "../entities/RefreshTokens.ts";

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly em: EntityManager) { }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const decoded = verifyRefreshToken(refreshToken);
    
    const tokenRecord = await this.em.findOne(RefreshTokens, { 
      token: refreshToken,
      isRevoked: false 
    });

    if (!tokenRecord) {
      throw new Error('Refresh token tidak valid atau sudah dicabut.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Refresh token sudah kadaluarsa. Silakan login ulang.');
    }

    const admin = await this.em.findOne(Admins, { id: decoded.id }, { populate: ['role'] });
    if (!admin || !admin.isActive) {
      throw new Error('Akun tidak ditemukan atau sudah dinonaktifkan.');
    }

    const newAccessToken = signAccessToken({
      id: admin.id,
      username: admin.username,
      role: admin.role.name
    });

    return {
      accessToken: newAccessToken,
      refreshToken
    };
  }

  async revoke(refreshToken: string): Promise<void> {
    const tokenRecord = await this.em.findOne(RefreshTokens, { token: refreshToken });
    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.em.flush();
    }
  }

  async revokeAll(adminId: number): Promise<void> {
    const tokens = await this.em.find(RefreshTokens, { 
      admin: adminId,
      isRevoked: false 
    });
    
    for (const token of tokens) {
      token.isRevoked = true;
    }
    await this.em.flush();
  }
}