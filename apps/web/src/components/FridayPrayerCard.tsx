const FRIDAY_PRAYER_DATA = [
  {
    pasaran: "Legi",
    imam: "Mamat",
    khatib: "Jono",
    bilal: "Ahmadi",
  },
  {
    pasaran: "Pahing",
    imam: "Budi",
    khatib: "Surya",
    bilal: "Rudi",
  },
  {
    pasaran: "Pon",
    imam: "Agus",
    khatib: "Hendra",
    bilal: "Dedi",
  },
  {
    pasaran: "Wage",
    imam: "Yusuf",
    khatib: "Fajar",
    bilal: "Irfan",
  },
  {
    pasaran: "Kliwon",
    imam: "Rahmat",
    khatib: "Indra",
    bilal: "Hakim",
  },
];

export function FridayPrayerCard() {
  return (
    <div className="bg-cyan-50 rounded-[20px] p-6 font-sans shadow-lg shadow-cyan-200/10 border-2 border-cyan-200/20">
      <h3 className="text-lg text-center font-bold text-cyan-900 mb-6 uppercase tracking-wide">
        Jadwal Shalat Jumat
      </h3>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-2 pb-3 border-b-2 border-cyan-200">
        <span className="text-[12px] font-bold text-cyan-900 uppercase tracking-wide">
          Pasaran
        </span>
        <span className="text-[12px] font-bold text-cyan-900 uppercase tracking-wide text-center">
          Imam
        </span>
        <span className="text-[12px] font-bold text-cyan-900 uppercase tracking-wide text-center">
          Khatib
        </span>
        <span className="text-[12px] font-bold text-cyan-900 uppercase tracking-wide text-center">
          Bilal
        </span>
      </div>

      {/* Table Body */}
      <div className="pt-3 space-y-2">
        {FRIDAY_PRAYER_DATA.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-2 text-[14px] text-gray-700"
          >
            <span className="font-medium text-cyan-700">{item.pasaran}</span>
            <span className="text-center">{item.imam}</span>
            <span className="text-center">{item.khatib}</span>
            <span className="text-center">{item.bilal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
