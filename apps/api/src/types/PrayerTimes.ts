export interface EquranIdPrayerTimesResponse {
  code: number;
  message: string;
  data: {
    provinsi: string;
    kabkota: string;
    bulan: number;
    tahun: number;
    bulan_nama: string;
    jadwal: PrayerTimeDaily[];
  };
}

export interface PrayerTimeDaily {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface PrayerTimesResponse {
  id: number;
  date: string;
  shortDate: string;
  longDate: Date;
  day: string;
  city: string;
  province: string;
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuha: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  createdAt?: Date;
}

export interface PrayerTimesFilter {
  date?: string;
  city?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
}
