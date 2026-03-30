import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EventService } from './event.ts';

jest.mock('../entities/Events.ts', () => ({ Events: class {}, EventsStatus: {} }));
jest.mock('../entities/EventTags.ts', () => ({ EventTags: class {} }));
jest.mock('../entities/EventCategories.ts', () => ({ EventCategories: class {} }));
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

function createMockEvent(overrides: Partial<any> = {}) {
  return {
    id: 1,
    title: 'Test Event',
    slug: 'test-event',
    descriptionMd: 'Event description',
    locationName: 'Mosque',
    locationDetail: 'Main hall',
    startDatetime: '2026-03-22T08:00:00Z',
    endDatetime: '2026-03-22T10:00:00Z',
    isAllDay: false,
    status: 'upcoming',
    isFree: true,
    category: { id: 1 },
    admin: { id: 1, name: 'Admin', username: 'admin' },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('EventService', () => {
  let service: EventService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new EventService(mockEm);
  });

  describe('find', () => {
    it('should return paginated events', async () => {
      mockEm.find.mockResolvedValue([createMockEvent()]);
      mockEm.count.mockResolvedValue(1);

      const result = await service.find({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply title filter', async () => {
      mockEm.find.mockResolvedValue([]);
      mockEm.count.mockResolvedValue(0);

      await service.find({ title: 'jumat' });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ title: { $contains: 'jumat' } }),
        expect.anything(),
      );
    });
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      mockEm.findOne.mockResolvedValue(createMockEvent());
      mockEm.find.mockResolvedValue([]);

      const result = await service.findById(1);

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test Event');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue(createMockEvent());

      const result = await service.delete(1);

      expect(result).toBe(true);
      expect(mockEm.remove).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should return tag strings', async () => {
      mockEm.find.mockResolvedValue([{ tag: 'islamic' }, { tag: 'community' }]);

      const result = await service.getTags(1);

      expect(result).toEqual(['islamic', 'community']);
    });
  });

  describe('setTags', () => {
    it('should clear existing tags and add new ones', async () => {
      mockEm.find.mockResolvedValue([{ tag: 'old-tag' }]);
      mockEm.findOneOrFail.mockResolvedValue(createMockEvent());

      await service.setTags(1, ['new-tag']);

      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.persist).toHaveBeenCalled();
    });
  });
});
