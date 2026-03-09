import { PrayCard } from "./card/PrayCard";
import { SunriseCard } from "./card/SunriseCard";

const PRAYER_TIMES = [
  { name: "Subuh", startOn: "04:15", iqamah: "04:30", active: true },
  { name: "Dzuhur", startOn: "11:45", iqamah: "12:00", active: false },
  { name: "Ashar", startOn: "14:30", iqamah: "14:45", active: false },
  { name: "Maghrib", startOn: "17:15", iqamah: "17:20", active: false },
  { name: "Isya", startOn: "18:30", iqamah: "18:45", active: false },
];

const SUNRISE_TIME = {
  label: "Terbit",
  startOn: "05:45",
  iqamah: "-",
};

export function PrayerCardGroup() {
  return (
    <div className="font-sans w-full max-w-[460px]">
      <SunriseCard
        label={SUNRISE_TIME.label}
        startOn={SUNRISE_TIME.startOn}
        iqamah={SUNRISE_TIME.iqamah}
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

      {PRAYER_TIMES.map((item, i) => (
        <PrayCard
          key={i}
          name={item.name}
          startOn={item.startOn}
          iqamah={item.iqamah}
          active={item.active}
        />
      ))}
    </div>
  );
}
