import type { FigureResponse } from "../lib/api/figures.ts";

export interface FigureCardProps {
  figure: FigureResponse;
  onClick?: () => void;
  featured?: boolean;
  className?: string;
}

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

const TITLE_COLORS = [
  "text-blue-600",
  "text-violet-600",
  "text-emerald-600",
  "text-amber-600",
  "text-rose-600",
  "text-cyan-600",
];

function getColorIndex(id: string | number) {
  return String(id).charCodeAt(0) % AVATAR_COLORS.length;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function FigureCard({ figure, onClick, featured = false, className = "" }: FigureCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getLifespan = () => {
    if (figure.birthYear || figure.deathYear) {
      return `${figure.birthYear || "?"}–${figure.deathYear || "sekarang"}`;
    }
    return null;
  };

  const colorIdx = getColorIndex(figure.id);
  const avatarColor = AVATAR_COLORS[colorIdx];
  const titleColor = TITLE_COLORS[colorIdx];

  return (
    <div
      className={`
        ${featured ? "p-5" : "p-4"}
        rounded-2xl bg-white border border-gray-100
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex gap-4 items-start">
        {/* Avatar: foto jika ada, inisial jika tidak */}
        {figure.imageUrl ? (
          <img
            src={figure.imageUrl}
            alt={figure.name}
            className={`
              rounded-full object-cover flex-shrink-0
              ${featured ? "w-16 h-16" : "w-14 h-14"}
            `}
          />
        ) : (
          <div
            className={`
              rounded-full flex items-center justify-center flex-shrink-0
              font-semibold select-none
              ${featured ? "w-16 h-16 text-xl" : "w-14 h-14 text-lg"}
              ${avatarColor.bg} ${avatarColor.text}
            `}
          >
            {getInitials(figure.name)}
          </div>
        )}

        {/* Info tokoh */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            {figure.name}
          </h3>

          {figure.title && (
            <p className={`text-sm font-medium mt-0.5 ${titleColor}`}>
              {figure.title}
            </p>
          )}

          {getLifespan() && (
            <p className="text-xs text-gray-400 mt-0.5">{getLifespan()}</p>
          )}

          {figure.bio && (
            <div className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: figure.bio }} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{formatDate(figure.createdAt)}</span>
        {figure.isFeatured && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${avatarColor.bg} ${avatarColor.text}`}
          >
            Unggulan
          </span>
        )}
      </div>
    </div>
  );
}
