import { SunLight } from "iconoir-react";
import type { SunriseCardProps } from "../../lib/prayCardTypes";

export function SunriseCard({
  label = "Terbit",
  startOn = "05:45",
  iqamah = "-",
  color = "yellow",
}: SunriseCardProps) {
  return (
    <div
      className={`
        bg-${color}-100 text-${color}-900
        rounded-[20px] px-7 py-5 mb-5
        font-sans text-[16px]
        shadow-lg shadow-${color}-200/50
        transition-transform duration-150 ease-in-out
        cursor-default
        hover:-translate-y-0.5 hover:shadow-xl
        flex items-center
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        <SunLight width={22} height={22} strokeWidth={2} />
        <span className="font-bold">{label}</span>
      </div>
      <span className="flex-1 text-center font-semibold">{startOn}</span>
      <span className="flex-1 text-right font-semibold">{iqamah}</span>
    </div>
  );
}
