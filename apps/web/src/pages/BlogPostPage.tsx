import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { blogsService, type BlogPost } from "../lib/api";
import { ArrowLeft, Calendar, User, Label, Eye } from "iconoir-react";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) {
        setError("Slug tidak valid");
        setLoading(false);
        return;
      }

      try {
        const data = await blogsService.getBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Artikel tidak ditemukan");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error || "Artikel tidak ditemukan"}</p>
          <button
            onClick={() => navigate("/news")}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
          >
            Kembali ke berita
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <article className="mx-auto max-w-4xl px-3 py-8 md:px-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/news")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke berita
      </button>

      {/* Featured Image */}
      {blog.coverImageUrl && (
        <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="h-[300px] w-full object-cover md:h-[400px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/800x400/0eb5f1/ffffff?text=" + encodeURIComponent(blog.title);
            }}
          />
        </div>
      )}

      {/* Title */}
      <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
        {blog.title}
      </h1>

      {/* Meta Information */}
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
        {blog.admin?.name && (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span className="font-medium">{blog.admin.name}</span>
          </span>
        )}
        {blog.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>
          </span>
        )}
        {blog.viewCount !== undefined && (
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{blog.viewCount} kali dibaca</span>
          </span>
        )}
        {blog.category && (
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700">
            {blog.category.name}
          </span>
        )}
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Label className="h-4 w-4 text-gray-500" />
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <div className="mb-8 rounded-lg bg-cyan-50 border-l-4 border-cyan-600 p-4">
          <p className="text-lg text-gray-700 italic">{blog.excerpt}</p>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-cyan prose-lg max-w-none">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="mb-4 text-2xl font-bold text-gray-900" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="mb-3 mt-6 text-xl font-bold text-gray-900" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-900" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-4 leading-relaxed text-gray-700" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="mb-4 list-disc pl-6 text-gray-700" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="mb-4 list-decimal pl-6 text-gray-700" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="mb-2" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="mb-4 border-l-4 border-cyan-600 pl-4 italic text-gray-700" {...props} />
              ),
              code: ({ node, inline, ...props }: any) => (
                inline ? (
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800" {...props} />
                ) : (
                  <code className="block overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100" {...props} />
                )
              ),
              pre: ({ node, ...props }) => (
                <pre className="mb-4" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="mx-auto my-4 max-w-full rounded-lg" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-cyan-600 underline hover:text-cyan-800" {...props} />
              ),
            }}
          >
            {blog.contentMd}
          </ReactMarkdown>
        </div>
      </div>

      {/* Article Footer */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/news")}
            className="text-cyan-600 hover:text-cyan-800 font-medium"
          >
            ← Lihat berita lainnya
          </button>
          {blog.updatedAt && (
            <p className="text-sm text-gray-500">
              Terakhir diupdate: {formatDate(blog.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
