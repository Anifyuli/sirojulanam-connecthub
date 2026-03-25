import type { JumatSchedule } from "../lib/api";

interface FridayPrayerCardProps {
  loading?: boolean;
  schedule?: (JumatSchedule & { date?: string; isNext?: boolean }) | null;
  compact?: boolean;
}

export function FridayPrayerCard({ loading = false, schedule, compact = false }: FridayPrayerCardProps) {
  if (compact && schedule) {
    return (
      <div className={`bg-cyan-50 rounded-lg p-4 font-sans ${schedule.isNext ? "border-2 border-cyan-400 shadow-md" : "border border-cyan-100 opacity-80"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-semibold ${schedule.isNext ? "text-cyan-900" : "text-gray-600"}`}>
            {schedule.date}
          </span>
          {schedule.isNext && (
            <span className="text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full">Terdekat</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div>
            <p className="text-[10px] uppercase text-cyan-600 font-bold">Imam</p>
            <p className="text-gray-800 truncate">{schedule.imam || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-cyan-600 font-bold">Khotbah</p>
            <p className="text-gray-800 truncate">{schedule.khotib || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-cyan-600 font-bold">Bilal</p>
            <p className="text-gray-800 truncate">{schedule.bilal || "-"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyan-50 rounded-[20px] p-6 font-sans shadow-lg shadow-cyan-200/10 border-2 border-cyan-200/20">
      <h3 className="text-lg text-center font-bold text-cyan-900 mb-4 uppercase tracking-wide">
        Jadwal Shalat Jumat
      </h3>

      {loading ? (
        <div className="py-4 text-center text-gray-500">
          Memuat jadwal...
        </div>
      ) : schedule ? (
        <div className="space-y-3">
          <div className="text-center pb-3 border-b border-cyan-200">
            <p className="text-sm text-gray-600">Jadwal terdekat:</p>
            <p className="font-semibold text-cyan-900">{schedule.date || "-"}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white rounded-lg">
              <p className="text-[9px] uppercase text-cyan-600 font-bold">Imam</p>
              <p className="text-xs font-medium text-gray-800">{schedule.imam || "-"}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <p className="text-[9px] uppercase text-cyan-600 font-bold">Khotbah</p>
              <p className="text-xs font-medium text-gray-800">{schedule.khotib || "-"}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <p className="text-[9px] uppercase text-cyan-600 font-bold">Bilal</p>
              <p className="text-xs font-medium text-gray-800">{schedule.bilal || "-"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">
          Tidak ada jadwal tersedia
        </div>
      )}
    </div>
  );
}
