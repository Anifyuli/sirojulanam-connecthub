import { EntityManager } from "@mikro-orm/core";
import { PrayerTimes } from "../entities/PrayerTimes.js";
import { PrayerTimesResponse, PrayerTimesFilter, EquranIdPrayerTimesResponse, PrayerTimeDaily } from "../types/PrayerTimes.js";

export class PrayerTimesService {
  private readonly API_BASE_URL = "https://equran.id/api/v2/shalat";

  constructor(private readonly em: EntityManager) { }

  private mapToResponse(prayer: PrayerTimes): PrayerTimesResponse {
    return {
      id: Number(prayer.id),
      date: prayer.date,
      shortDate: prayer.shortDate,
      longDate: prayer.longDate,
      day: prayer.day,
      city: prayer.city,
      province: prayer.province,
      imsak: prayer.imsak,
      fajr: prayer.fajr,
      sunrise: prayer.sunrise,
      dhuha: prayer.dhuha,
      dhuhr: prayer.dhuhr,
      asr: prayer.asr,
      maghrib: prayer.maghrib,
      isha: prayer.isha,
      createdAt: prayer.createdAt,
    };
  }

  private mapEquranIdToEntity(
    daily: PrayerTimeDaily,
    province: string,
    city: string
  ): Omit<PrayerTimesResponse, 'id' | 'createdAt'> {
    return {
      date: daily.tanggal_lengkap,
      shortDate: daily.tanggal_lengkap,
      longDate: new Date(daily.tanggal_lengkap),
      day: daily.hari,
      city: city,
      province: province,
      imsak: daily.imsak,
      fajr: daily.subuh,
      sunrise: daily.terbit,
      dhuha: daily.dhuha,
      dhuhr: daily.dzuhur,
      asr: daily.ashar,
      maghrib: daily.maghrib,
      isha: daily.isya,
    };
  }

  async find(filter: PrayerTimesFilter = {}): Promise<PrayerTimesResponse[]> {
    const where: any = {};

    if (filter.date) {
      where.date = filter.date;
    }
    if (filter.city) {
      where.city = filter.city;
    }
    if (filter.startDate && filter.endDate) {
      where.date = { $gte: filter.startDate, $lte: filter.endDate };
    }

    const prayerTimes = await this.em.find(PrayerTimes, where, {
      orderBy: { date: 'ASC' }
    });

    return prayerTimes.map((prayer) => this.mapToResponse(prayer));
  }

  async findAll(): Promise<PrayerTimesResponse[]> {
    return this.find();
  }

  async findById(id: number): Promise<PrayerTimesResponse | null> {
    const prayer = await this.em.findOne(PrayerTimes, { id });

    if (!prayer) {
      return null;
    }

    return this.mapToResponse(prayer);
  }

  async findByDateAndCity(date: string, city: string): Promise<PrayerTimesResponse | null> {
    const prayer = await this.em.findOne(PrayerTimes, { date, city });

    if (!prayer) {
      return null;
    }

    return this.mapToResponse(prayer);
  }

  async fetchAndSaveFromEquranId(
    province: string,
    city: string,
    month: number,
    year: number
  ): Promise<PrayerTimesResponse[]> {
    const results: PrayerTimesResponse[] = [];

    try {
      // Fetch dari API equran.id
      const response = await fetch(this.API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provinsi: province,
          kabkota: city,
          bulan: month,
          tahun: year,
        }),
      });

      const result: EquranIdPrayerTimesResponse = await response.json();

      if (result.code !== 200) {
        throw new Error(`Gagal mengambil jadwal sholat: ${result.message}`);
      }

      // Normalisasi nama kota
      const normalizedCity = city === 'Kab. Pati' && result.data.kabkota === 'Kab. Pati' ? city : result.data.kabkota;

      // Hapus SEMUA data lama untuk kota ini (hanya bulan yang di-fetch)
      await this.em.nativeDelete(PrayerTimes, {
        city: normalizedCity,
      });

      // Simpan semua jadwal ke database
      for (const daily of result.data.jadwal) {
        // Cek apakah sudah ada di database (coba kota baru dulu, lalu kota lama)
        let existing = await this.em.findOne(PrayerTimes, {
          date: daily.tanggal_lengkap,
          city: normalizedCity,
        });

        // Jika tidak ketemu, coba cari dengan nama kota lama
        // Langsung insert data baru (data lama sudah dihapus di atas)
        const prayerData = this.mapEquranIdToEntity(daily, province, normalizedCity);

        const prayerTimes = new PrayerTimes();
        prayerTimes.date = prayerData.date;
        prayerTimes.shortDate = prayerData.shortDate;
        prayerTimes.longDate = prayerData.longDate;
        prayerTimes.day = prayerData.day;
        prayerTimes.city = prayerData.city;
        prayerTimes.province = prayerData.province;
        prayerTimes.imsak = prayerData.imsak;
        prayerTimes.fajr = prayerData.fajr;
        prayerTimes.sunrise = prayerData.sunrise;
        prayerTimes.dhuha = prayerData.dhuha;
        prayerTimes.dhuhr = prayerData.dhuhr;
        prayerTimes.asr = prayerData.asr;
        prayerTimes.maghrib = prayerData.maghrib;
        prayerTimes.isha = prayerData.isha;

        this.em.persist(prayerTimes);
        await this.em.flush();
        results.push(this.mapToResponse(prayerTimes));
      }

      return results;
    } catch (error) {
      throw new Error(`Gagal mengambil jadwal sholat: ${error instanceof Error ? error.message : "Unknown error"}`, { cause: error });
    }
  }

  async fetchAndSaveRangeFromEquranId(
    province: string,
    city: string,
    month: number,
    year: number
  ): Promise<PrayerTimesResponse[]> {
    return this.fetchAndSaveFromEquranId(province, city, month, year);
  }

  async upsert(
    data: Omit<PrayerTimesResponse, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrayerTimesResponse> {
    const existing = await this.em.findOne(PrayerTimes, {
      date: data.date,
      city: data.city
    });

    if (existing) {
      // Update
      existing.shortDate = data.shortDate;
      existing.longDate = data.longDate;
      existing.day = data.day;
      existing.province = data.province;
      existing.fajr = data.fajr;
      existing.sunrise = data.sunrise;
      existing.dhuhr = data.dhuhr;
      existing.dhuha = data.dhuha;
      existing.asr = data.asr;
      existing.maghrib = data.maghrib;
      existing.isha = data.isha;
      existing.imsak = data.imsak;
      existing.updatedAt = new Date();

      await this.em.flush();
      return this.mapToResponse(existing);
    } else {
      // Create
      const prayerTimes = new PrayerTimes();
      prayerTimes.date = data.date;
      prayerTimes.shortDate = data.shortDate;
      prayerTimes.longDate = data.longDate;
      prayerTimes.day = data.day;
      prayerTimes.city = data.city;
      prayerTimes.province = data.province;
      prayerTimes.fajr = data.fajr;
      prayerTimes.sunrise = data.sunrise;
      prayerTimes.dhuhr = data.dhuhr;
      prayerTimes.dhuha = data.dhuha;
      prayerTimes.asr = data.asr;
      prayerTimes.maghrib = data.maghrib;
      prayerTimes.isha = data.isha;
      prayerTimes.imsak = data.imsak;

      this.em.persist(prayerTimes);
      await this.em.flush();

      return this.mapToResponse(prayerTimes);
    }
  }

  async delete(id: number): Promise<boolean> {
    const prayer = await this.em.findOne(PrayerTimes, { id });

    if (!prayer) {
      return false;
    }

    this.em.remove(prayer);
    await this.em.flush();
    return true;
  }

  async deleteByDateAndCity(date: string, city: string): Promise<boolean> {
    const prayer = await this.em.findOne(PrayerTimes, { date, city });

    if (!prayer) {
      return false;
    }

    this.em.remove(prayer);
    await this.em.flush();
    return true;
  }

  async update(
    id: number,
    data: Partial<Omit<PrayerTimesResponse, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PrayerTimesResponse | null> {
    const prayer = await this.em.findOne(PrayerTimes, { id });

    if (!prayer) {
      return null;
    }

    if (data.shortDate !== undefined) prayer.shortDate = data.shortDate;
    if (data.longDate !== undefined) prayer.longDate = data.longDate;
    if (data.day !== undefined) prayer.day = data.day;
    if (data.date !== undefined) prayer.date = data.date;
    if (data.city !== undefined) prayer.city = data.city;
    if (data.province !== undefined) prayer.province = data.province;
    if (data.fajr !== undefined) prayer.fajr = data.fajr;
    if (data.sunrise !== undefined) prayer.sunrise = data.sunrise;
    if (data.dhuhr !== undefined) prayer.dhuhr = data.dhuhr;
    if (data.dhuha !== undefined) prayer.dhuha = data.dhuha;
    if (data.asr !== undefined) prayer.asr = data.asr;
    if (data.maghrib !== undefined) prayer.maghrib = data.maghrib;
    if (data.isha !== undefined) prayer.isha = data.isha;
    if (data.imsak !== undefined) prayer.imsak = data.imsak;

    prayer.updatedAt = new Date();

    await this.em.flush();
    return this.mapToResponse(prayer);
  }
}
