import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BlogService } from './blogs.ts';

jest.mock('../entities/BlogPosts.ts', () => ({ BlogPosts: class {} }));
jest.mock('../entities/BlogTags.ts', () => ({ BlogTags: class {} }));
jest.mock('../entities/BlogCategories.ts', () => ({ BlogCategories: class {} }));
jest.mock('../entities/Admins.ts', () => ({ Admins: class {} }));

function createMockEntityManager() {
  return {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    remove: jest.fn(),
    getReference: jest.fn(),
  } as any;
}

function createMockBlog(overrides: Partial<any> = {}) {
  return {
    id: 1,
    title: 'Test Blog',
    slug: 'test-blog',
    excerpt: 'Test excerpt',
    contentMd: '<p>Test content</p>',
    coverImageUrl: '',
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(),
    viewCount: 0,
    metaTitle: '',
    metaDescription: '',
    category: { id: 1 },
    admin: { id: 1, name: 'Admin', username: 'admin' },
    tags: {
      init: jest.fn(),
      getItems: jest.fn().mockReturnValue([]),
      add: jest.fn(),
      removeAll: jest.fn(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BlogService', () => {
  let service: BlogService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new BlogService(mockEm);
  });

  describe('find', () => {
    it('should return paginated blog posts', async () => {
      const mockBlog = createMockBlog();
      mockEm.find.mockResolvedValue([mockBlog]);
      mockEm.count.mockResolvedValue(1);

      const result = await service.find({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should apply title filter', async () => {
      mockEm.find.mockResolvedValue([]);
      mockEm.count.mockResolvedValue(0);

      await service.find({ title: 'test' });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ title: { $contains: 'test' } }),
        expect.anything(),
      );
    });

    it('should apply published filter', async () => {
      mockEm.find.mockResolvedValue([]);
      mockEm.count.mockResolvedValue(0);

      await service.find({ isPublished: true });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isPublished: true }),
        expect.anything(),
      );
    });
  });

  describe('findById', () => {
    it('should return blog when found', async () => {
      const mockBlog = createMockBlog();
      mockEm.findOne.mockResolvedValue(mockBlog);

      const result = await service.findById(1);

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test Blog');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return blog when found by slug', async () => {
      const mockBlog = createMockBlog({ slug: 'my-post' });
      mockEm.findOne.mockResolvedValue(mockBlog);

      const result = await service.findBySlug('my-post');

      expect(result).not.toBeNull();
      expect(result!.slug).toBe('my-post');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue(createMockBlog());

      const result = await service.delete(1);

      expect(result).toBe(true);
      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      const mockBlog = createMockBlog({ viewCount: 5 });
      mockEm.findOne.mockResolvedValue(mockBlog);

      await service.incrementViewCount(1);

      expect(mockBlog.viewCount).toBe(6);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it('should not throw when blog not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      await expect(service.incrementViewCount(999)).resolves.not.toThrow();
    });
  });

  describe('getTags', () => {
    it('should return tag strings', async () => {
      mockEm.find.mockResolvedValue([
        { tag: 'react' },
        { tag: 'typescript' },
      ]);

      const result = await service.getTags(1);

      expect(result).toEqual(['react', 'typescript']);
    });
  });

  describe('clearTags', () => {
    it('should remove all tags for a post', async () => {
      const mockTags = [{ tag: 'react' }, { tag: 'ts' }];
      mockEm.find.mockResolvedValue(mockTags);

      await service.clearTags(1);

      expect(mockEm.remove).toHaveBeenCalledTimes(2);
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });
});
