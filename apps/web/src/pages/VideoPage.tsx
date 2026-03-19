import { useState, useEffect, useMemo } from "react";
import { Pagination, type PaginationData } from "../components/Pagination";
import { videosService, type Video } from "../lib/api";
import { Search } from "iconoir-react";

const ITEMS_PER_PAGE = 6;

interface VideoItem {
  id: number;
  title: string;
  thumbnail: string;
  embedUrl: string;
  sourcePlatform: string;
}

function getEmbedUrl(video: Video): string {
  if (video.embedUrl) {
    return video.embedUrl;
  }
  
  if (video.sourcePlatform === "youtube" && video.sourceUrl) {
    const videoId = video.sourceUrl.split("v=")[1]?.split("&")[0] || video.sourceUrl.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (video.sourcePlatform === "tiktok" && video.sourceUrl) {
    return video.sourceUrl;
  }
  
  return video.sourceUrl || "";
}

function mapVideoToItem(video: Video): VideoItem {
  return {
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail || "https://placehold.co/400x225/0eb5f1/ffffff?text=Video",
    embedUrl: getEmbedUrl(video),
    sourcePlatform: video.sourcePlatform,
  };
}

export function VideoPage() {
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchVideos(page: number) {
      setLoading(true);
      try {
        if (useApi) {
          const response = await videosService.getAll({
            page,
            limit: ITEMS_PER_PAGE,
          });
          
          if (response.data && response.data.length > 0) {
            const mappedVideos = response.data.map(mapVideoToItem);
            setAllVideos(mappedVideos);
            setPagination({
              currentPage: 1,
              totalPages: response.pagination.totalPages,
              totalItems: response.pagination.total,
              itemsPerPage: ITEMS_PER_PAGE,
            });
          } else {
            setUseApi(false);
          }
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setUseApi(false);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos(pagination.currentPage);
  }, [useApi]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return allVideos;
    const query = searchQuery.toLowerCase();
    return allVideos.filter((video) =>
      video.title.toLowerCase().includes(query)
    );
  }, [allVideos, searchQuery]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(filteredVideos.length / ITEMS_PER_PAGE),
      totalItems: filteredVideos.length,
    }));
  }, [filteredVideos.length]);

  const paginatedVideos = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVideos, pagination.currentPage]);

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 md:px-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Video Terbaru
      </h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari video..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        />
      </div>

      {searchQuery && (
        <p className="mb-4 text-sm text-gray-600">
          Menampilkan {paginatedVideos.length} dari {filteredVideos.length} hasil untuk "{searchQuery}"
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
            <p className="text-gray-600">Memuat video...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedVideos.map((video: VideoItem) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
                      <svg
                        className="ml-1 h-6 w-6 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                    {video.title}
                  </h3>
                  <span className="mt-2 inline-block rounded bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700 capitalize">
                    {video.sourcePlatform}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {paginatedVideos.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Belum ada video tersedia
            </div>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            showingLabel={`Menampilkan ${paginatedVideos.length} dari ${pagination.totalItems} video`}
          />
        </>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={handleCloseVideo}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={selectedVideo.embedUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {selectedVideo.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}