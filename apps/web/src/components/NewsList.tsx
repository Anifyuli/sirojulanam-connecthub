import { NewsCard } from "./NewsCard";

export interface NewsItem {
  id: string | number;
  title: string;
  excerpt: string;
  thumbnail: string;
  slug?: string;
}

export interface NewsListProps {
  items?: NewsItem[];
  onNewsClick?: (news: NewsItem) => void;
  className?: string;
}

export function NewsList({
  items = [],
  onNewsClick,
  className = "",
}: NewsListProps) {
  if (items.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        Belum ada berita
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((news) => (
        <NewsCard
          key={news.id}
          thumbnail={news.thumbnail}
          title={news.title}
          excerpt={news.excerpt}
          onClick={() => onNewsClick?.(news)}
        />
      ))}
    </div>
  );
}
