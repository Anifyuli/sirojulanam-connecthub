import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi, type PostResponse } from "../lib/api/posts.ts";
import { PostCard } from "../components/PostCard.tsx";
import { Pagination } from "../components/Pagination.tsx";

export function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPosts(1);
  }, []);

  const loadPosts = async (targetPage: number) => {
    try {
      setLoading(true);
      const response = await postsApi.getAll({
        isPublished: true,
        page: targetPage,
        limit: 10,
      });
      setPosts(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setPage(targetPage);
    } catch {
      setError("Gagal memuat konten");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadPosts(newPage);
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      await postsApi.addReaction(postId, { adminId: 1, reactionType });
      loadPosts(page);
    } catch {
      console.error("Gagal menambah reaksi");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Opini & Inspirasi</h1>
        <p className="mt-1.5 text-gray-500">
          Kumpulan opini, kutipan inspiratif, dan sosok-sosok motivasi
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-gray-400">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Belum ada konten untuk kategori ini.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/opini/${post.id}`)}
                onReaction={handleReaction}
              />
            ))}
          </div>

          <Pagination
            pagination={{
              currentPage: page,
              totalPages,
              totalItems: total,
              itemsPerPage: 10,
            }}
            onPageChange={handlePageChange}
            showingLabel={`Menampilkan ${posts.length} dari ${total} konten`}
          />
        </>
      )}
    </div>
  );
}
