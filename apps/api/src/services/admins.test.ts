import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AdminService } from '../services/admins';

jest.mock('../lib/jwt', () => ({
  signAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  signRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../utils/hash', () => ({
  hashPassword: () => Promise.resolve('hashed-password'),
  verifyPassword: () => Promise.resolve(true),
}));

function createMockEntityManager() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    remove: jest.fn(),
    getReference: jest.fn(),
  } as any;
}

describe('AdminService', () => {
  let service: AdminService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new AdminService(mockEm);
  });

  describe('findById', () => {
    it('should return admin when found', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        role: { id: 1, name: 'manager' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEm.findOne.mockResolvedValue(mockAdmin);

      const result = await service.findById(1);

      expect(result).toEqual({
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        roleId: 1,
        roleName: 'manager',
        isActive: true,
        createdAt: mockAdmin.createdAt,
        updatedAt: mockAdmin.updatedAt,
      });
      expect(mockEm.findOne).toHaveBeenCalledWith(
        expect.anything(),
        { id: 1 },
        { populate: ['role'] }
      );
    });

    it('should return null when admin not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return admin when found by email', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        role: { id: 1, name: 'manager' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEm.findOne.mockResolvedValue(mockAdmin);

      const result = await service.findByEmail('admin@test.com');

      expect(result).not.toBeNull();
      expect(result!.email).toBe('admin@test.com');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should return paginated admins', async () => {
      const mockAdmins = [
        {
          id: 1,
          username: 'admin1',
          name: 'Admin One',
          email: 'admin1@test.com',
          role: { id: 1, name: 'manager' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          username: 'admin2',
          name: 'Admin Two',
          email: 'admin2@test.com',
          role: { id: 2, name: 'editor' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockEm.find.mockResolvedValue(mockAdmins);
      mockEm.count.mockResolvedValue(2);

      const result = await service.find({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      mockEm.find.mockResolvedValue([]);
      mockEm.count.mockResolvedValue(25);

      const result = await service.find({}, { page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('delete', () => {
    it('should return true when admin is deleted', async () => {
      const mockAdmin = { id: 1, name: 'Admin' };
      mockEm.findOne.mockResolvedValue(mockAdmin);

      const result = await service.delete(1);

      expect(result).toBe(true);
      expect(mockEm.remove).toHaveBeenCalledWith(mockAdmin);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it('should return false when admin not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.delete(999);

      expect(result).toBe(false);
      expect(mockEm.remove).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update admin fields', async () => {
      const mockAdmin = {
        id: 1,
        name: 'Old Name',
        email: 'old@test.com',
        role: { id: 1, name: 'manager' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEm.findOne.mockResolvedValue(mockAdmin);

      const result = await service.update(1, { name: 'New Name' });

      expect(mockAdmin.name).toBe('New Name');
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.name).toBe('New Name');
    });

    it('should return null when admin not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.update(999, { name: 'Test' });

      expect(result).toBeNull();
    });
  });
});
