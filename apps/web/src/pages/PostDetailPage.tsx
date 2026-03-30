import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postsApi, type PostResponse } from "../lib/api/posts.ts";
import { ArrowLeft } from "iconoir-react/regular";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      const response = await postsApi.getById(postId);
      if (response.success && response.data) {
        setPost(response.data);
      } else {
        setError("Opini tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat opini");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">{error || "Opini tidak ditemukan"}</p>
          <Link to="/opini" className="text-cyan-500 hover:text-cyan-600">
            ← Kembali ke opini
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
      <Link
        to="/opini"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-cyan-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke opini
      </Link>

      <article className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {post.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
        )}

        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-sm">
              {post.admin?.name?.charAt(0) || "A"}
            </div>
            <span className="font-medium text-gray-700">{post.admin?.name || "Admin"}</span>
          </div>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <div 
          className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
          {post.viewCount} dilihat
        </div>
      </article>
    </div>
  );
}