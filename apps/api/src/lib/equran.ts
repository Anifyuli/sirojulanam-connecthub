import axios from "axios";
import { EquranIdPrayerTimesResponse } from "../types/PrayerTimes.ts";

export async function fetchPrayerTimesFromEquranId(
  provinsi: string,
  kabkota: string,
  bulan: number,
  tahun: number
): Promise<EquranIdPrayerTimesResponse> {
  const response = await axios.post<EquranIdPrayerTimesResponse>(
    "https://equran.id/api/v2/shalat",
    {
      provinsi: provinsi,
      kabkota: kabkota,
      bulan: bulan,
      tahun: tahun,
    }
  );
  return response.data;
}
