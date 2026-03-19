export interface RegisterDto {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface CreateAdminDto {
  name: string;
  username: string;
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

export interface AdminFilter {
  name?: string;
  email?: string;
  username?: string;
  isActive?: boolean;
  roleId?: number;
}

export interface AdminResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}