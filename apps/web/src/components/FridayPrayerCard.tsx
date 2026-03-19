import type { JumatSchedule } from "../lib/api";

interface FridayPrayerCardProps {
  loading?: boolean;
  schedule?: JumatSchedule | null;
}

export function FridayPrayerCard({ loading = false, schedule }: FridayPrayerCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString("id-ID", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

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
            <p className="font-semibold text-cyan-900">{formatDate(schedule.date)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-[10px] uppercase text-cyan-600 font-bold">Imam</p>
              <p className="text-sm font-medium text-gray-800">{schedule.imam || "-"}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-[10px] uppercase text-cyan-600 font-bold">Khotbah</p>
              <p className="text-sm font-medium text-gray-800">{schedule.khotbah || "-"}</p>
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
