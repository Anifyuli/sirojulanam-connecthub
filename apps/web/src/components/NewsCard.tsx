export interface NewsCardProps {
  thumbnail?: string;
  title?: string;
  excerpt?: string;
  onClick?: () => void;
  className?: string;
}

export function NewsCard({
  thumbnail = "https://placehold.co/120x120",
  title = "Judul Berita",
  excerpt = "Ini adalah potongan awal dari berita yang akan ditampilkan di sini sebagai preview...",
  onClick,
  className = "",
}: NewsCardProps) {
  return (
    <div
      className={`
        flex gap-4 rounded-[16px] bg-white p-4
        shadow-sm border-2 border-gray-100
        transition-all duration-200 ease-in-out
        cursor-pointer
        hover:shadow-md hover:border-cyan-200
        ${className}
      `}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="shrink-0">
        <img
          src={thumbnail}
          alt={title}
          className="h-24 w-28 object-cover rounded-[12px]"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug">
          {title}
        </h3>
        <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
      </div>
    </div>
  );
}
