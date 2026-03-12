import { EntityManager } from '@mikro-orm/core';
import { Admins } from '../entities/Admins.ts';
import { Roles } from '../entities/Roles.ts';

export interface CreateAdminDto {
  name: string;
  email: string;
  passwordHash: string;
  roleId: number;
}

export interface UpdateAdminDto {
  name?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface AdminResponse {
  id: number;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminService {
  constructor(private readonly em: EntityManager) { }

  async findAll(): Promise<AdminResponse[]> {
    const admins = await this.em.find(Admins, {}, { populate: ['role'] });

    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role.id,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    }));
  }

  async findById(id: number): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { id }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role.id,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
  }

  async findByEmail(email: string): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { email }, { populate: ['role'] });

    if (!admin) {
      return null;
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role.id,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
  }

  async create(data: CreateAdminDto): Promise<AdminResponse> {
    const role = this.em.getReference(Roles, data.roleId);

    const admin = new Admins();
    admin.name = data.name;
    admin.email = data.email;
    admin.passwordHash = data.passwordHash;
    admin.role = role;
    admin.isActive = true;

    this.em.persist(admin);
    this.em.flush();

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role.id,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
  }

  async update(id: number, data: UpdateAdminDto): Promise<AdminResponse | null> {
    const admin = await this.em.findOne(Admins, { id });

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

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role.id,
      isActive: admin.isActive,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
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
