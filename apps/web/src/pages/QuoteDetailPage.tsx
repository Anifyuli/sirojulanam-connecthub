import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quotesApi, type QuoteResponse } from "../lib/api/quotes.ts";
import { ArrowLeft } from "iconoir-react/regular";

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadQuote(id);
    }
  }, [id]);

  const loadQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      const response = await quotesApi.getById(quoteId);
      if (response.success && response.data) {
        setQuote(response.data);
      } else {
        setError("Kutipan tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat kutipan");
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

  if (error || !quote) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">{error || "Kutipan tidak ditemukan"}</p>
          <Link to="/quotes" className="text-cyan-500 hover:text-cyan-600">
            ← Kembali ke kutipan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
      <Link
        to="/quotes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-cyan-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke kutipan
      </Link>

      <article className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <blockquote className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed mb-4">
          <div dangerouslySetInnerHTML={{ __html: `&ldquo;${quote.content}&rdquo;` }} />
        </blockquote>

        {quote.source && (
          <p className="text-gray-500 text-sm mb-4">— {quote.source}</p>
        )}

        {quote.category && (
          <div className="mb-4">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${quote.category.colorHex || "#e0f2fe"}`, color: "#0f172a" }}
            >
              {quote.category.name}
            </span>
          </div>
        )}

        {quote.tags && quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quote.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
          Dipublikasikan pada {new Date(quote.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </article>
    </div>
  );
}