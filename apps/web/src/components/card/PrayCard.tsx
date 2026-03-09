import { Clock } from "iconoir-react";
import type { PrayCardProps } from "../../lib/prayCardTypes";

export function PrayCard({
  name = "Subuh",
  startOn = "04:15",
  iqamah = "04:30",
  active = false,
  activeColor = "cyan",
}: PrayCardProps) {
  return (
    <div
      className={`
        flex items-center rounded-[20px] px-7 py-4.5 mb-3
        font-sans text-[15px] font-semibold
        transition-all duration-200 ease-in-out
        cursor-default
        ${active
          ? `bg-${activeColor}-100 text-${activeColor}-900 shadow-lg shadow-${activeColor}-200/50`
          : `bg-white text-gray-900 shadow-sm hover:shadow-md`
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        <Clock width={20} height={20} strokeWidth={2} />
        <span>{name}</span>
      </div>
      <span className="flex-1 text-center">{startOn}</span>
      <span className="flex-1 text-right">{iqamah}</span>
    </div>
  );
}
