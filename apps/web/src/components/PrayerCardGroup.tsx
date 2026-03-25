import { useState, useEffect } from "react";
import { Clock } from "iconoir-react";
import { prayerTimesService, dailyPrayerSchedulesService, type PrayerTime, type DailyPrayerSchedule } from "../lib/api";

const DEFAULT_PRAYER_TIMES = [
  { name: "Subuh", startOn: "04:15", iqamah: "04:30", imam: "", active: true },
  { name: "Dzuhur", startOn: "11:45", iqamah: "12:00", imam: "", active: false },
  { name: "Ashar", startOn: "14:30", iqamah: "14:45", imam: "", active: false },
  { name: "Maghrib", startOn: "17:15", iqamah: "17:20", imam: "", active: false },
  { name: "Isya", startOn: "18:30", iqamah: "18:45", imam: "", active: false },
];

const DEFAULT_SUNRISE_TIME = {
  label: "Terbit",
  startOn: "05:45",
  iqamah: "-",
};

function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  return time.substring(0, 5);
}

export function PrayerCardGroup() {
  const [prayerTime, setPrayerTime] = useState<PrayerTime | null>(null);
  const [dailySchedules, setDailySchedules] = useState<DailyPrayerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];

        const [prayerData, schedulesData] = await Promise.all([
          prayerTimesService.getByDateAndCity(dateStr, "Pati"),
          dailyPrayerSchedulesService.getAll(),
        ]);

        setPrayerTime(prayerData);
        setDailySchedules(schedulesData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch prayer time:", err);
        setError("Gagal memuat jadwal salat");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getImam = (prayTimeName: string): string => {
    const prayTimeMap: Record<string, string> = {
      "Subuh": "fajr",
      "Dzuhur": "dhuhr",
      "Ashar": "asr",
      "Maghrib": "maghrib",
      "Isya": "isha",
    };
    const apiPrayTime = prayTimeMap[prayTimeName];
    const schedule = dailySchedules.find(s => s.prayTime === apiPrayTime);
    return schedule?.imam || "";
  };
  // https://equran.id/apidev
  const getPrayerTimes = () => {
    if (loading || error || !prayerTime) {
      return DEFAULT_PRAYER_TIMES;
    }

    return [
      { name: "Subuh", startOn: formatTime(prayerTime.fajr), iqamah: "04:30", imam: getImam("Subuh"), active: isActivePrayer("Subuh") },
      { name: "Dzuhur", startOn: formatTime(prayerTime.dhuhr), iqamah: "12:00", imam: getImam("Dzuhur"), active: isActivePrayer("Dzuhur") },
      { name: "Ashar", startOn: formatTime(prayerTime.asr), iqamah: "14:45", imam: getImam("Ashar"), active: isActivePrayer("Ashar") },
      { name: "Maghrib", startOn: formatTime(prayerTime.maghrib), iqamah: "17:20", imam: getImam("Maghrib"), active: isActivePrayer("Maghrib") },
      { name: "Isya", startOn: formatTime(prayerTime.isha), iqamah: "18:45", imam: getImam("Isya"), active: isActivePrayer("Isya") },
    ];
  };

  const isActivePrayer = (prayerName: string): boolean => {
    if (!prayerTime) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const prayerTimes: Record<string, string> = {
      "Subuh": formatTime(prayerTime.fajr),
      "Dzuhur": formatTime(prayerTime.dhuhr),
      "Ashar": formatTime(prayerTime.asr),
      "Maghrib": formatTime(prayerTime.maghrib),
      "Isya": formatTime(prayerTime.isha),
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
      "Subuh": formatTime(prayerTime.fajr),
      "Dzuhur": formatTime(prayerTime.dhuhr),
      "Ashar": formatTime(prayerTime.asr),
      "Maghrib": formatTime(prayerTime.maghrib),
      "Isya": formatTime(prayerTime.isha),
    };

    return prayerTimes[nextPrayer] || "23:59";
  };

  const getSunriseTime = () => {
    if (loading || error || !prayerTime) {
      return DEFAULT_SUNRISE_TIME;
    }
    return {
      label: "Terbit",
      startOn: formatTime(prayerTime.sunrise),
      iqamah: "-",
    };
  };

  const prayerTimes = getPrayerTimes();
  const sunriseTime = getSunriseTime();

  return (
    <div className="font-sans w-full max-w-4xl space-y-4">
      {/* Waktu Terbit - Separate Section */}
      <div className="bg-yellow-100 text-yellow-900 rounded-[20px] px-7 py-5 shadow-lg shadow-yellow-200/50 flex items-center">
        <div className="flex items-center gap-3">
          <Clock width={22} height={22} strokeWidth={2} />
          <span className="font-bold">{sunriseTime.label}</span>
        </div>
        <div className="flex-1"></div>
        <span className="font-semibold">{sunriseTime.startOn}</span>
      </div>

      {/* Jadwal Sholat - Separate Section */}
      <div>
        {/* Table Header */}
        <div className="flex px-4 pb-3 pt-2 border-b border-gray-200">
          <span className="font-bold text-sm text-gray-500 flex-[2] uppercase tracking-wide">
            Shalat
          </span>
          <span className="font-bold text-sm text-gray-500 flex-1 text-center uppercase tracking-wide">
            Mulai
          </span>
          <span className="font-bold text-sm text-gray-500 flex-1 text-right uppercase tracking-wide">
            Iqamah
          </span>
          <span className="font-bold text-sm text-gray-500 flex-2 text-right uppercase tracking-wide">
            Imam
          </span>
        </div>

        {prayerTimes.map((item, i) => (
          <div
            key={i}
            className={`flex items-center px-4 py-4 ${item.active ? "bg-cyan-100 mx-[-0.1rem] my-1 py-4 px-4 rounded-lg" : ""
              }`}
          >
            <span className="flex-[2] flex items-center gap-3 font-semibold text-gray-900">
              <Clock width={18} height={18} strokeWidth={2} className="text-gray-400" />
              {item.name}
            </span>
            <span className="flex-1 text-center text-gray-700">{item.startOn}</span>
            <span className="flex-1 text-right text-gray-700">{item.iqamah}</span>
            <span className="flex-2 text-right text-gray-500">{item.imam || "-"}</span>
          </div>
        ))}

        {loading && (
          <p className="mt-4 px-4 text-sm text-gray-500">Memuat jadwal...</p>
        )}
        {error && (
          <p className="mt-4 px-4 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
