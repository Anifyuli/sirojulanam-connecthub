import { EntityManager } from "@mikro-orm/core";
import { PrayerTimes } from "../entities/PrayerTimes.ts";
import { PrayerTimesResponse, PrayerTimesFilter, EquranIdPrayerTimesResponse, PrayerTimeDaily } from "../types/PrayerTimes.ts";

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

      // Simpan semua jadwal ke database
      for (const daily of result.data.jadwal) {
        // Cek apakah sudah ada di database
        const existing = await this.em.findOne(PrayerTimes, {
          date: daily.tanggal_lengkap,
          city: city,
        });

        const prayerData = this.mapEquranIdToEntity(daily, province, city);

        if (existing) {
          // Update
          existing.shortDate = prayerData.shortDate;
          existing.longDate = prayerData.longDate;
          existing.day = prayerData.day;
          existing.province = prayerData.province;
          existing.imsak = prayerData.imsak;
          existing.fajr = prayerData.fajr;
          existing.sunrise = prayerData.sunrise;
          existing.dhuha = prayerData.dhuha;
          existing.dhuhr = prayerData.dhuhr;
          existing.asr = prayerData.asr;
          existing.maghrib = prayerData.maghrib;
          existing.isha = prayerData.isha;
          existing.updatedAt = new Date();

          await this.em.flush();
          results.push(this.mapToResponse(existing));
        } else {
          // Create
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
}
