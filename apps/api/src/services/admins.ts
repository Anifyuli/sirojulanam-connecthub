import { EntityManager } from '@mikro-orm/core';
import { Admins } from '../entities/Admins';
import { Roles } from '../entities/Roles';
import { RefreshTokens } from '../entities/RefreshTokens';
import { CreateAdminDto, UpdateAdminDto, AdminResponse, RegisterDto, AdminFilter } from '../types/Admin';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { verifyPassword, hashPassword } from '../utils/hash';
import { PaginationParams, PaginatedResponse } from '../types/pagination';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Omit<AdminResponse, 'roleId' | 'roleName'> & { role: string } & { username: string };
}

export class AdminService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(admin: Admins): Promise<AdminResponse> {
    return {
      id: Number(admin.id),
      username: admin.username,
      name: admin.name,
      email: admin.email,
      roleId: Number(admin.role.id),
      roleName: admin.role.name,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
  }

  async find(filter: AdminFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<AdminResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filter.name) {
      where.name = { $contains: filter.name };
    }
    if (filter.email) {
      where.email = { $contains: filter.email };
    }
    if (filter.username) {
      where.username = { $contains: filter.username };
    }
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.roleId) {
      where.role = { id: filter.roleId };
    }

    const [admins, total] = await Promise.all([
      this.em.find(Admins, where, { populate: ['role'], limit, offset }),
      this.em.count(Admins, where),
    ]);

    const data = await Promise.all(admins.map((admin) => this.mapToResponse(admin)));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findAll(): Promise<AdminResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findById(id: number): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { id }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    return this.mapToResponse(admin);
  }

  async findByEmail(email: string): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { email }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    return this.mapToResponse(admin);
  }

  async findByUsername(username: string): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { username }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    return this.mapToResponse(admin);
  }

  async login(email: string, username: string, password: string, rememberMe = false): Promise<LoginResponse> {
    const admin = await this.em.findOne(Admins, {
      $or: [
        { email },
        { username }
      ]
    }, { populate: ['role'] });

    if (!admin) {
      throw new Error('Username/email atau password salah.');
    }

    if (!admin.isActive) {
      throw new Error('Akun telah dinonaktifkan. Hubungi administrator.');
    }

    const isPasswordValid = await verifyPassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Username/email atau password salah.');
    }

    const accessToken = signAccessToken({
      id: admin.id,
      username: admin.username,
      role: admin.role.name
    });

    const refreshToken = signRefreshToken({ id: admin.id });

    // Extend refresh token expiry if "Remember Me" is checked (30 days instead of 7)
    const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    const refreshTokenEntity = new RefreshTokens();
    refreshTokenEntity.admin = admin;
    refreshTokenEntity.token = refreshToken;
    refreshTokenEntity.expiresAt = new Date(Date.now() + refreshTokenExpiry);
    refreshTokenEntity.isRevoked = false;
    this.em.persist(refreshTokenEntity);
    await this.em.flush();

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role.name,
        isActive: admin.isActive,
        createdAt: admin.createdAt!,
        updatedAt: admin.updatedAt!,
      },
    };
  }

  async register(data: RegisterDto): Promise<LoginResponse> {
    const existingAdmin = await this.em.findOne(Admins, { email: data.email });
    if (existingAdmin) {
      throw new Error('Email sudah terdaftar. Gunakan email lain.');
    }

    const existingUsername = await this.em.findOne(Admins, { username: data.username });
    if (existingUsername) {
      throw new Error('Username sudah digunakan. Gunakan username lain.');
    }

    let role = await this.em.findOne(Roles, { name: 'editor' });
    if (!role) {
      role = await this.em.findOne(Roles, { name: 'Editor' });
    }
    if (!role) {
      throw new Error('Role editor tidak ditemukan. Hubungi administrator.');
    }

    const admin = new Admins();
    admin.name = data.name;
    admin.username = data.username;
    admin.email = data.email;
    admin.passwordHash = await hashPassword(data.password);
    admin.role = role;
    admin.isActive = true;

    this.em.persist(admin);
    await this.em.flush();

    const accessToken = signAccessToken({
      id: admin.id,
      username: admin.username,
      role: role.name
    });

    const refreshToken = signRefreshToken({ id: admin.id });

    const refreshTokenEntity = new RefreshTokens();
    refreshTokenEntity.admin = admin;
    refreshTokenEntity.token = refreshToken;
    refreshTokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshTokenEntity.isRevoked = false;
    this.em.persist(refreshTokenEntity);
    await this.em.flush();

    const roleName = role.id === 1 ? "manager" : "editor";

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: roleName,
        isActive: admin.isActive,
        createdAt: admin.createdAt!,
        updatedAt: admin.updatedAt!,
      },
    };
  }

  async create(data: CreateAdminDto): Promise<AdminResponse> {
    const role = this.em.getReference(Roles, data.roleId);

    const admin = new Admins();
    admin.name = data.name;
    admin.username = data.username;
    admin.email = data.email;
    admin.passwordHash = await hashPassword(data.passwordHash);
    admin.role = role;
    admin.isActive = true;

    this.em.persist(admin);
    await this.em.flush();

    const savedAdmin = await this.em.findOne(Admins, { id: admin.id }, { populate: ['role'] });

    return this.mapToResponse(savedAdmin!);
  }

  async update(id: number, data: UpdateAdminDto): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { id }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    if (data.name !== undefined) {
      admin.name = data.name;
    }

    if (data.email !== undefined) {
      admin.email = data.email;
    }

    if (data.roleId !== undefined) {
      admin.role = this.em.getReference(Roles, data.roleId);
    }

    if (data.isActive !== undefined) {
      admin.isActive = data.isActive;
    }

    await this.em.flush();

    return this.mapToResponse(admin);
  }

  async updateProfile(id: number, data: { name?: string; email?: string; username?: string; currentPassword?: string; newPassword?: string }): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { id }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    if (data.name !== undefined) {
      admin.name = data.name;
    }

    if (data.email !== undefined) {
      const existingEmail = await this.em.findOne(Admins, { email: data.email, id: { $ne: id } });
      if (existingEmail) {
        throw new Error('Email sudah digunakan oleh akun lain.');
      }
      admin.email = data.email;
    }

    if (data.username !== undefined) {
      const existingUsername = await this.em.findOne(Admins, { username: data.username, id: { $ne: id } });
      if (existingUsername) {
        throw new Error('Username sudah digunakan oleh akun lain.');
      }
      admin.username = data.username;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error('Password lama wajib diisi untuk mengubah password.');
      }
      const isValid = await verifyPassword(data.currentPassword, admin.passwordHash);
      if (!isValid) {
        throw new Error('Password lama salah.');
      }
      admin.passwordHash = await hashPassword(data.newPassword);
    }

    await this.em.flush();

    return this.mapToResponse(admin);
  }

  async delete(id: number): Promise<boolean> {
    const admin = await this.em.findOne(Admins, { id });

    if (!admin) {
      return false;
    }

    this.em.remove(admin);
    await this.em.flush();
    return true;
  }
}
