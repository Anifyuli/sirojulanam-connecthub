import { useState, useEffect, useMemo } from "react";
import { Pagination, type PaginationData } from "../components/Pagination";
import { videosService, type Video } from "../lib/api";
import { Search, Xmark } from "iconoir-react";
import { TikTokEmbed } from "react-social-media-embed";

const ITEMS_PER_PAGE = 9;

interface VideoItem {
  id: number;
  title: string;
  thumbnail: string;
  embedUrl: string;
  sourceUrl: string;
  sourcePlatform: string;
  sourceType: string;
}

function getEmbedUrl(video: Video): string {
  const sourceType = (video.sourceType || "").toLowerCase();
  const sourceUrl = video.sourceUrl || "";
  const platformVideoId = video.platformVideoId;

  if (sourceType === "youtube" && sourceUrl) {
    const videoId =
      platformVideoId ||
      sourceUrl.split("v=")[1]?.split("&")[0] ||
      sourceUrl.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (sourceType === "youtube_shorts" && sourceUrl) {
    const videoId =
      platformVideoId || sourceUrl.split("/").pop()?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (sourceType === "tiktok" && sourceUrl) {
    const videoId =
      platformVideoId || sourceUrl.split("/").pop()?.split("?")[0];
    if (videoId) return `https://www.tiktok.com/embed/v2/${videoId}`;
    return sourceUrl;
  }

  return sourceUrl;
}

function getThumbnail(video: Video): string {
  const sourceType = (video.sourceType || "").toLowerCase();
  const sourceUrl = video.sourceUrl || "";
  const platformVideoId = video.platformVideoId;

  if (sourceType === "youtube" || sourceType === "youtube_shorts") {
    const videoId =
      platformVideoId ||
      sourceUrl.split("v=")[1]?.split("&")[0] ||
      sourceUrl.split("/").pop();
    if (videoId)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  return "";
}

function mapVideoToItem(video: Video): VideoItem {
  return {
    id: video.id,
    title: video.title,
    thumbnail: getThumbnail(video),
    embedUrl: getEmbedUrl(video),
    sourceUrl: video.sourceUrl || "",
    sourcePlatform: video.sourceType?.replace("_", " ") || "video",
    sourceType: video.sourceType || "",
  };
}

// ── YouTube / Shorts card ──────────────────────────────────────────────────
function YouTubeCard({
  video,
  onClick,
}: {
  video: VideoItem;
  onClick: (v: VideoItem) => void;
}) {
  const isShorts = video.sourceType.toLowerCase() === "youtube_shorts";

  return (
    <div
      onClick={() => onClick(video)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 fill-white opacity-80"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z" />
              <path
                d="M9.75 15.5V8.5l6.25 3.5-6.25 3.5z"
                className="fill-red-600"
              />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
          <div className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            <svg
              className="ml-0.5 h-6 w-6 text-gray-800"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Platform badge */}
        <span className="absolute right-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
          {isShorts ? "Shorts" : "YouTube"}
        </span>
      </div>

      {/* Title */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
          {video.title}
        </h3>
      </div>
    </div>
  );
}

// ── TikTok card (thumbnail-only, no embed) ─────────────────────────────────
function TikTokCard({
  video,
  onClick,
}: {
  video: VideoItem;
  onClick: (v: VideoItem) => void;
}) {
  return (
    <div
      onClick={() => onClick(video)}
      className="group cursor-pointer overflow-hidden rounded-2xl shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ aspectRatio: "9/16" }}
    >
      <div className="relative flex h-full flex-col bg-gray-950">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/60 via-gray-950 to-gray-950" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-600/20 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-cyan-600/10 blur-3xl" />
        </div>

        {/* TikTok logo */}
        <div className="relative z-10 p-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
          </svg>
        </div>

        {/* Center play button */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:border-pink-400/60 group-hover:bg-pink-500/20">
            <svg
              className="ml-0.5 h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-white/40 transition-colors group-hover:text-pink-400">
            Tap untuk tonton
          </span>
        </div>

        {/* Bottom: title */}
        <div className="relative z-10 p-4 pt-2">
          <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-white">
            {video.title}
          </h3>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-medium text-pink-300">
            TikTok
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loaders ───────────────────────────────────────────────────────
function YouTubeSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="aspect-video animate-pulse bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 animate-pulse rounded bg-gray-200" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

function TikTokSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl bg-gray-800"
      style={{ aspectRatio: "9/16" }}
    />
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
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
            setAllVideos(response.data.map(mapVideoToItem));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useApi, pagination.currentPage]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return allVideos;
    const q = searchQuery.toLowerCase();
    return allVideos.filter((v) => v.title.toLowerCase().includes(q));
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
    const start = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVideos, pagination.currentPage]);

  const { tiktokVideos, otherVideos } = useMemo(() => {
    const tiktok: VideoItem[] = [];
    const other: VideoItem[] = [];
    paginatedVideos.forEach((v) =>
      v.sourceType.toLowerCase() === "tiktok"
        ? tiktok.push(v)
        : other.push(v),
    );
    return { tiktokVideos: tiktok, otherVideos: other };
  }, [paginatedVideos]);

  const hasBothTypes = tiktokVideos.length > 0 && otherVideos.length > 0;

  const handleVideoClick = (video: VideoItem) => setSelectedVideo(video);
  const handleCloseVideo = () => setSelectedVideo(null);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isTikTokModal = selectedVideo?.sourceType?.toLowerCase() === "tiktok";

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 md:px-6">
      {/* ── Header ── */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Video Terbaru</h1>
        <p className="mt-1.5 text-gray-500">
          Nikmati konten video terbaru dari kami
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari video..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
          >
            <Xmark className="h-4 w-4" />
          </button>
        )}
      </div>

      {searchQuery && !loading && (
        <p className="mb-5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {filteredVideos.length} video
          </span>{" "}
          ditemukan untuk &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <YouTubeSkeleton key={i} />
            ))}
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <TikTokSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── YouTube / Shorts section ── */}
          {otherVideos.length > 0 && (
            <section>
              {hasBothTypes && (
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-800">YouTube</h2>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    {otherVideos.length} video
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherVideos.map((video) => (
                  <YouTubeCard
                    key={video.id}
                    video={video}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── TikTok section ── */}
          {tiktokVideos.length > 0 && (
            <section className={hasBothTypes ? "mt-12" : ""}>
              {hasBothTypes && (
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-800">TikTok</h2>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-600">
                    {tiktokVideos.length} video
                  </span>
                </div>
              )}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(160px, 1fr))",
                }}
              >
                {tiktokVideos.map((video) => (
                  <TikTokCard
                    key={video.id}
                    video={video}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {tiktokVideos.length === 0 && otherVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <svg
                className="h-12 w-12 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium">Belum ada video tersedia</p>
            </div>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            showingLabel={`Menampilkan ${paginatedVideos.length} dari ${pagination.totalItems} video`}
          />
        </>
      )}

      {/* ── Modal ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={handleCloseVideo}
        >
          <button
            onClick={handleCloseVideo}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <Xmark className="h-6 w-6" />
          </button>
          <div
            className={`relative w-full ${isTikTokModal ? "max-w-md" : "max-w-4xl"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Embed */}
            {isTikTokModal ? (
              <div className="overflow-hidden rounded-2xl bg-black">
                <TikTokEmbed url={selectedVideo.sourceUrl} width="100%" />
              </div>
            ) : (
              <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
                <iframe
                  src={selectedVideo.embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}

            <p className="mt-3 text-center text-xs text-white/40">
              Klik di luar area video untuk menutup
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
