import { useState, useEffect } from "react";
import { PrayCard } from "./card/PrayCard";
import { SunriseCard } from "./card/SunriseCard";
import { prayerTimesService, type PrayerTime } from "../lib/api";

const DEFAULT_PRAYER_TIMES = [
  { name: "Subuh", startOn: "04:15", iqamah: "04:30", active: true },
  { name: "Dzuhur", startOn: "11:45", iqamah: "12:00", active: false },
  { name: "Ashar", startOn: "14:30", iqamah: "14:45", active: false },
  { name: "Maghrib", startOn: "17:15", iqamah: "17:20", active: false },
  { name: "Isya", startOn: "18:30", iqamah: "18:45", active: false },
];

const DEFAULT_SUNRISE_TIME = {
  label: "Terbit",
  startOn: "05:45",
  iqamah: "-",
};


export function PrayerCardGroup() {
  const [prayerTime, setPrayerTime] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrayerTime() {
      try {
        setLoading(true);
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];
        const prayerData = await prayerTimesService.getByDateAndCity(dateStr, "Sidoarjo");
        setPrayerTime(prayerData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch prayer time:", err);
        setError("Gagal memuat jadwal salat");
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerTime();
  }, []);

  const getPrayerTimes = () => {
    if (loading || error || !prayerTime) {
      return DEFAULT_PRAYER_TIMES;
    }

    return [
      { name: "Subuh", startOn: prayerTime.subuh, iqamah: "04:30", active: isActivePrayer("Subuh") },
      { name: "Dzuhur", startOn: prayerTime.dzuhur, iqamah: "12:00", active: isActivePrayer("Dzuhur") },
      { name: "Ashar", startOn: prayerTime.ashar, iqamah: "14:45", active: isActivePrayer("Ashar") },
      { name: "Maghrib", startOn: prayerTime.maghrib, iqamah: "17:20", active: isActivePrayer("Maghrib") },
      { name: "Isya", startOn: prayerTime.isya, iqamah: "18:45", active: isActivePrayer("Isya") },
    ];
  };

  const isActivePrayer = (prayerName: string): boolean => {
    if (!prayerTime) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const prayerTimes: Record<string, string> = {
      "Subuh": prayerTime.subuh,
      "Dzuhur": prayerTime.dzuhur,
      "Ashar": prayerTime.ashar,
      "Maghrib": prayerTime.maghrib,
      "Isya": prayerTime.isya,
    };

    const prayerTimeStr = prayerTimes[prayerName];
    if (!prayerTimeStr) return false;

    return currentTime >= prayerTimeStr && currentTime < getNextPrayerTime(prayerName);
  };

  const getNextPrayerTime = (currentPrayer: string): string => {
    if (!prayerTime) return "23:59";
    
    const order = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
    const currentIndex = order.indexOf(currentPrayer);
    
    if (currentIndex === order.length - 1) return "23:59";
    
    const nextPrayer = order[currentIndex + 1];
    const prayerTimes: Record<string, string> = {
      "Subuh": prayerTime.subuh,
      "Dzuhur": prayerTime.dzuhur,
      "Ashar": prayerTime.ashar,
      "Maghrib": prayerTime.maghrib,
      "Isya": prayerTime.isya,
    };
    
    return prayerTimes[nextPrayer] || "23:59";
  };

  const getSunriseTime = () => {
    if (loading || error || !prayerTime) {
      return DEFAULT_SUNRISE_TIME;
    }
    return {
      label: "Terbit",
      startOn: prayerTime.sunrise,
      iqamah: "-",
    };
  };

  const prayerTimes = getPrayerTimes();
  const sunriseTime = getSunriseTime();

  return (
    <div className="font-sans w-full max-w-[460px]">
      <SunriseCard
        label={sunriseTime.label}
        startOn={sunriseTime.startOn}
        iqamah={sunriseTime.iqamah}
      />

      {/* Table Header */}
      <div className="flex pb-3.5 pt-8">
        <span className="font-bold text-[13px] text-gray-900 flex-1 uppercase tracking-wide">
          Shalat
        </span>
        <span className="font-bold text-[13px] text-gray-900 flex-1 text-center uppercase tracking-wide">
          Mulai
        </span>
        <span className="font-bold text-[13px] text-gray-900 flex-1 text-right uppercase tracking-wide">
          Iqamah
        </span>
      </div>

      {prayerTimes.map((item, i) => (
        <PrayCard
          key={i}
          name={item.name}
          startOn={item.startOn}
          iqamah={item.iqamah}
          active={item.active}
        />
      ))}

      {loading && (
        <p className="mt-2 text-sm text-gray-500">Memuat jadwal...</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
