import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PrayerTimesService } from './prayerTimes';

jest.mock('../entities/PrayerTimes', () => ({ PrayerTimes: class {} }));

function createMockEntityManager() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    remove: jest.fn(),
  } as any;
}

function createMockPrayerTime(overrides: Partial<any> = {}) {
  return {
    id: 1,
    date: '2026-03-22',
    shortDate: '2026-03-22',
    longDate: new Date('2026-03-22'),
    day: 'Minggu',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    imsak: '04:30',
    fajr: '04:40',
    sunrise: '05:55',
    dhuha: '06:15',
    dhuhr: '11:50',
    asr: '15:10',
    maghrib: '17:55',
    isha: '19:05',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('PrayerTimesService', () => {
  let service: PrayerTimesService;
  let mockEm: ReturnType<typeof createMockEntityManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEm = createMockEntityManager();
    service = new PrayerTimesService(mockEm);
  });

  describe('find', () => {
    it('should return prayer times list', async () => {
      mockEm.find.mockResolvedValue([createMockPrayerTime()]);

      const result = await service.find();

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('Jakarta');
      expect(result[0].fajr).toBe('04:40');
    });

    it('should filter by date', async () => {
      mockEm.find.mockResolvedValue([]);

      await service.find({ date: '2026-03-22' });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ date: '2026-03-22' }),
        expect.anything(),
      );
    });

    it('should filter by city', async () => {
      mockEm.find.mockResolvedValue([]);

      await service.find({ city: 'Jakarta' });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ city: 'Jakarta' }),
        expect.anything(),
      );
    });

    it('should filter by date range', async () => {
      mockEm.find.mockResolvedValue([]);

      await service.find({ startDate: '2026-03-01', endDate: '2026-03-31' });

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          date: { $gte: '2026-03-01', $lte: '2026-03-31' },
        }),
        expect.anything(),
      );
    });
  });

  describe('findById', () => {
    it('should return prayer time when found', async () => {
      mockEm.findOne.mockResolvedValue(createMockPrayerTime());

      const result = await service.findById(1);

      expect(result).not.toBeNull();
      expect(result!.day).toBe('Minggu');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByDateAndCity', () => {
    it('should return prayer time when found', async () => {
      mockEm.findOne.mockResolvedValue(createMockPrayerTime());

      const result = await service.findByDateAndCity('2026-03-22', 'Jakarta');

      expect(result).not.toBeNull();
      expect(result!.city).toBe('Jakarta');
    });

    it('should return null when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.findByDateAndCity('2026-03-22', 'Bandung');

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should update existing prayer time', async () => {
      const existing = createMockPrayerTime();
      mockEm.findOne.mockResolvedValue(existing);

      const result = await service.upsert({
        date: '2026-03-22',
        shortDate: '2026-03-22',
        longDate: new Date(),
        day: 'Minggu',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        imsak: '04:35',
        fajr: '04:45',
        sunrise: '05:55',
        dhuha: '06:15',
        dhuhr: '11:50',
        asr: '15:10',
        maghrib: '17:55',
        isha: '19:05',
      });

      expect(existing.imsak).toBe('04:35');
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.imsak).toBe('04:35');
    });

    it('should create new prayer time when not exists', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.upsert({
        date: '2026-03-23',
        shortDate: '2026-03-23',
        longDate: new Date(),
        day: 'Senin',
        city: 'Bandung',
        province: 'Jawa Barat',
        imsak: '04:30',
        fajr: '04:40',
        sunrise: '05:55',
        dhuha: '06:15',
        dhuhr: '11:50',
        asr: '15:10',
        maghrib: '17:55',
        isha: '19:05',
      });

      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.city).toBe('Bandung');
    });
  });

  describe('delete', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue(createMockPrayerTime());

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

  describe('deleteByDateAndCity', () => {
    it('should return true when deleted', async () => {
      mockEm.findOne.mockResolvedValue(createMockPrayerTime());

      const result = await service.deleteByDateAndCity('2026-03-22', 'Jakarta');

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      const result = await service.deleteByDateAndCity('2026-03-22', 'Bandung');

      expect(result).toBe(false);
    });
  });
});
