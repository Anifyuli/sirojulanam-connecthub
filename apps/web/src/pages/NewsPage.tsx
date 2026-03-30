import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, type PaginationData } from "../components/Pagination";
import { blogsService, type BlogPost } from "../lib/api";
import { Search } from "iconoir-react";
import { Post } from "iconoir-react/regular";

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: string;
  slug: string;
  publishedAt?: string;
  tags?: string[];
}

const ITEMS_PER_PAGE = 5;

function mapBlogToNewsItem(blog: BlogPost): NewsItem {
  return {
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt || (blog.contentMd ? blog.contentMd.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : ""),
    thumbnail: blog.coverImageUrl,
    slug: blog.slug,
    publishedAt: blog.publishedAt,
    tags: blog.tags,
  };
}

export function NewsPage() {
  const navigate = useNavigate();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNews = async (page: number) => {
    setLoading(true);
    try {
      const response = await blogsService.getAll({
        page,
        limit: ITEMS_PER_PAGE,
      });

      const mappedNews = response.data.map(mapBlogToNewsItem);
      setAllNews(mappedNews);
      setPagination({
        currentPage: page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        itemsPerPage: ITEMS_PER_PAGE,
      });
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1);
  }, []);

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return allNews;
    const query = searchQuery.toLowerCase();
    return allNews.filter(
      (news) =>
        news.title.toLowerCase().includes(query) ||
        news.excerpt.toLowerCase().includes(query)
    );
  }, [allNews, searchQuery]);

  const handleNewsClick = (news: NewsItem) => {
    navigate(`/news/${news.slug}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setSearchQuery("");
      fetchNews(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-8 md:px-6">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sirojul Anam Terkini</h1>
        <p className="mt-1.5 text-gray-500">
          Ikuti perkembangan dan warta seputar Islam dan Masjid Sirojul Anam
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berita..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        />
      </div>

      {searchQuery && (
        <p className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredNews.length} dari {allNews.length} hasil untuk "{searchQuery}"
        </p>
      )}

      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? "Tidak ada hasil yang cocok" : "Belum ada berita"}
          </p>
        </div>
      ) : (
        <>
          <NewsList items={filteredNews} onNewsClick={handleNewsClick} />
          {!searchQuery && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              showingLabel={`Menampilkan ${filteredNews.length} dari ${pagination.totalItems} berita`}
            />
          )}
        </>
      )}
    </div>
  );
}

interface NewsListProps {
  items: NewsItem[];
  onNewsClick: (news: NewsItem) => void;
}

function NewsList({ items, onNewsClick }: NewsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((news) => (
        <article
          key={news.id}
          className="flex cursor-pointer gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          onClick={() => onNewsClick(news)}
        >
          {news.thumbnail ? (
            <img
              src={news.thumbnail}
              alt={news.title}
              className="h-24 w-32 flex-shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded bg-cyan-50">
              <Post className="h-10 w-10 text-cyan-500" />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                {news.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {news.excerpt}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {news.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {news.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{news.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
