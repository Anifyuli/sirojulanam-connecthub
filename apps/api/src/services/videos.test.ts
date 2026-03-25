import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VideoService } from './videos.ts';
import { VideosSourceType } from '../entities/Videos.ts';

jest.mock('../entities/Videos.ts', () => ({
  Videos: class {},
  VideosSourceType: {
    YOUTUBE: 'youtube',
    YOUTUBE_SHORTS: 'youtube_shorts',
    TIKTOK: 'tiktok',
    LOCAL: 'local',
  },
}));
jest.mock('../entities/VideoTags.ts', () => ({ VideoTags: class {} }));
jest.mock('../entities/VideoCategories.ts', () => ({ VideoCategories: class {} }));
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

function createMockVideo(overrides: Partial<any> = {}) {
  return {
    id: 1,
    title: 'Test Video',
    slug: 'test-video',
    description: 'Video description',
    sourceType: 'youtube',
    sourceUrl: 'https://youtube.com/watch?v=abc',
    platformVideoId: 'abc',
    localFileUrl: null,
    thumbnailUrl: 'https://img.youtube.com/vi/abc/0.jpg',
    durationSeconds: 300,
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(),
    viewCount: 0,
    category: { id: 1 },
    admin: { id: 1, name: 'Admin', username: 'admin' },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('VideoService', () => {
  let service: VideoService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new VideoService(mockEm);
  });

  describe('find', () => {
    it('should return paginated videos', async () => {
      mockEm.find.mockResolvedValue([createMockVideo()]);
      mockEm.count.mockResolvedValue(1);

      const result = await service.find({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply sourceType filter', async () => {
      mockEm.find.mockResolvedValue([]);
      mockEm.count.mockResolvedValue(0);

      await service.find({ sourceType: VideosSourceType.YOUTUBE });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ sourceType: 'youtube' }),
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
    it('should return video when found', async () => {
      mockEm.findOne.mockResolvedValue(createMockVideo());
      mockEm.find.mockResolvedValue([]);

      const result = await service.findById(1);

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test Video');
      expect(result!.sourceType).toBe('youtube');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByTitle', () => {
    it('should return video when found', async () => {
      mockEm.findOne.mockResolvedValue(createMockVideo({ title: 'Khutbah Jumat' }));
      mockEm.find.mockResolvedValue([]);

      const result = await service.findByTitle('Khutbah Jumat');

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Khutbah Jumat');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findByTitle('Not Found');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue(createMockVideo());

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

  describe('findByCategory', () => {
    it('should return videos by category', async () => {
      mockEm.find.mockResolvedValue([createMockVideo()]);
      mockEm.count.mockResolvedValue(1);

      const result = await service.findByCategory(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('getTags', () => {
    it('should return tag strings', async () => {
      mockEm.find.mockResolvedValue([{ tag: 'khutbah' }, { tag: 'jumat' }]);

      const result = await service.getTags(1);

      expect(result).toEqual(['khutbah', 'jumat']);
    });
  });
});
