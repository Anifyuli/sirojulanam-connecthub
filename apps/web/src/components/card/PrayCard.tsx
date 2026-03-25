import { Clock, User } from "iconoir-react";
import type { PrayCardProps } from "../../lib/prayCardTypes";

export function PrayCard({
  name = "Subuh",
  startOn = "04:15",
  iqamah = "04:30",
  imam,
  active = false,
  activeColor = "cyan",
}: PrayCardProps) {
  return (
    <div
      className={`
        flex items-center rounded-[20px] px-7 py-5 mb-3
        font-sans text-base font-semibold
        transition-all duration-200 ease-in-out
        cursor-default
        ${active
          ? `bg-${activeColor}-100 text-${activeColor}-900 shadow-lg shadow-${activeColor}-200/50`
          : `bg-white text-gray-900 shadow-sm hover:shadow-md`
        }
      `}
    >
      <div className="flex items-center gap-3 flex-[1.5]">
        <Clock width={22} height={22} strokeWidth={2} />
        <span>{name}</span>
      </div>
      <span className="flex-1 text-center">{startOn}</span>
      <span className="flex-[1.5] text-right flex items-center justify-end gap-2">
        {imam && <span className="text-sm font-normal text-gray-500 flex items-center gap-1"><User width={14} height={14} />{imam}</span>}
        <span>{iqamah}</span>
      </span>
    </div>
  );
}
