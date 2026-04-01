import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TaxonomyService } from './taxonomy';

jest.mock('../entities/EventCategories', () => ({ EventCategories: class {} }));
jest.mock('../entities/EventTags', () => ({ EventTags: class {} }));
jest.mock('../entities/BlogCategories', () => ({ BlogCategories: class {} }));
jest.mock('../entities/BlogTags', () => ({ BlogTags: class {} }));
jest.mock('../entities/VideoCategories', () => ({ VideoCategories: class {} }));
jest.mock('../entities/VideoTags', () => ({ VideoTags: class {} }));
jest.mock('../entities/Events', () => ({ Events: class {} }));
jest.mock('../entities/BlogPosts', () => ({ BlogPosts: class {} }));
jest.mock('../entities/Videos', () => ({ Videos: class {} }));

function createMockEntityManager() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    remove: jest.fn(),
  } as any;
}

describe('TaxonomyService', () => {
  let service: TaxonomyService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new TaxonomyService(mockEm);
  });

  describe('getCategories', () => {
    it('should return categories with item counts for blog', async () => {
      mockEm.find.mockResolvedValue([
        { id: 1, name: 'News', slug: 'news', colorHex: '#ff0000' },
      ]);
      mockEm.count.mockResolvedValue(5);

      const result = await service.getCategories('blog');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        name: 'News',
        slug: 'news',
        color_hex: '#ff0000',
        item_count: 5,
        type: 'blog',
      });
    });

    it('should return categories for event type', async () => {
      mockEm.find.mockResolvedValue([
        { id: 1, name: 'Kajian', slug: 'kajian' },
      ]);
      mockEm.count.mockResolvedValue(3);

      const result = await service.getCategories('event');

      expect(result[0].type).toBe('event');
    });
  });

  describe('getCategoryById', () => {
    it('should return category when found', async () => {
      mockEm.findOne.mockResolvedValue({ id: 1, name: 'News', slug: 'news' });
      mockEm.count.mockResolvedValue(5);

      const result = await service.getCategoryById('blog', 1);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('News');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.getCategoryById('blog', 999);

      expect(result).toBeNull();
    });
  });

  describe('createCategory', () => {
    it('should create and return category', async () => {
      const result = await service.createCategory('blog', {
        name: 'Tutorial',
        slug: 'tutorial',
      });

      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.name).toBe('Tutorial');
      expect(result.type).toBe('blog');
    });
  });

  describe('updateCategory', () => {
    it('should update category when found', async () => {
      const mockCat = { id: 1, name: 'Old', slug: 'old' };
      mockEm.findOne.mockResolvedValue(mockCat);

      const result = await service.updateCategory('blog', 1, { name: 'New' });

      expect(mockCat.name).toBe('New');
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result!.name).toBe('New');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.updateCategory('blog', 999, { name: 'X' });

      expect(result).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue({ id: 1, name: 'Test' });

      const result = await service.deleteCategory('blog', 1);

      expect(result).toBe(true);
      expect(mockEm.remove).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.deleteCategory('blog', 999);

      expect(result).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should return tags with counts', async () => {
      mockEm.find.mockResolvedValue([
        { tag: 'react' },
        { tag: 'react' },
        { tag: 'typescript' },
      ]);

      const result = await service.getTags('blog');

      expect(result).toHaveLength(2);
      expect(result.find(t => t.tag === 'react')!.count).toBe(2);
      expect(result.find(t => t.tag === 'typescript')!.count).toBe(1);
    });
  });

  describe('deleteTag', () => {
    it('should return true when tags deleted', async () => {
      mockEm.find.mockResolvedValue([{ tag: 'old-tag' }]);

      const result = await service.deleteTag('blog', 'old-tag');

      expect(result).toBe(true);
      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it('should return false when no tags found', async () => {
      mockEm.find.mockResolvedValue([]);

      const result = await service.deleteTag('blog', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('createTag', () => {
    it('should create and return tag', async () => {
      const result = await service.createTag('event', 'ramadhan');

      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.tag).toBe('ramadhan');
      expect(result.type).toBe('event');
    });
  });
});
