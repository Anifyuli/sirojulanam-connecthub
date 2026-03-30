import type { QuoteResponse } from "../lib/api/quotes.ts";

export interface QuoteCardProps {
  quote: QuoteResponse;
  onClick?: () => void;
  featured?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  default: { bg: "bg-cyan-100", text: "text-cyan-800" },
  hadis:   { bg: "bg-blue-100", text: "text-blue-800" },
  quran:   { bg: "bg-emerald-100", text: "text-emerald-800" },
  ulama:   { bg: "bg-amber-100", text: "text-amber-800" },
  umum:    { bg: "bg-gray-100", text: "text-gray-700" },
};

function getCategoryColor(name?: string) {
  if (!name) return CATEGORY_COLORS.default;
  const key = name.toLowerCase();
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

const QUOTE_ACCENT_COLORS = [
  "text-cyan-500",
  "text-amber-500",
  "text-emerald-500",
  "text-violet-500",
];

function getAccentColor(id: string | number) {
  const index = String(id).charCodeAt(0) % QUOTE_ACCENT_COLORS.length;
  return QUOTE_ACCENT_COLORS[index];
}

export function QuoteCard({ quote, onClick, featured = false, className = "" }: QuoteCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const accentColor = getAccentColor(quote.id);
  const categoryColor = getCategoryColor(quote.category?.name);

  return (
    <div
      className={`
        ${featured ? "p-6" : "p-5"}
        rounded-2xl bg-white border border-gray-100
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Dekoratif tanda kutip besar */}
      <p
        className={`font-serif text-5xl leading-none mb-1 select-none ${accentColor}`}
        aria-hidden="true"
      >
        &ldquo;
      </p>

      {/* Isi kutipan */}
      <p
        className={`
          italic text-gray-800 whitespace-pre-wrap leading-relaxed
          ${featured ? "text-lg" : "text-base"}
        `}
      >
        <div dangerouslySetInnerHTML={{ __html: quote.content }} />
      </p>

      {/* Sumber */}
      {quote.source && (
        <p className={`mt-3 text-sm font-semibold ${accentColor}`}>
          — {quote.source}
        </p>
      )}

      {/* Footer: kategori + tanggal + featured badge */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {quote.category && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryColor.bg} ${categoryColor.text}`}
            >
              {quote.category.name}
            </span>
          )}
          {quote.isFeatured && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
              Unggulan
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{formatDate(quote.createdAt)}</span>
      </div>
    </div>
  );
}
