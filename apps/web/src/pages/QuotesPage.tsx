import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quotesApi, type QuoteResponse } from "../lib/api/quotes.ts";
import { QuoteCard } from "../components/QuoteCard.tsx";
import { Pagination } from "../components/Pagination.tsx";

export function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadQuotes(1);
  }, []);

  const loadQuotes = async (targetPage: number) => {
    try {
      setLoading(true);
      const response = await quotesApi.getAll({
        isPublished: true,
        page: targetPage,
        limit: 10,
      });

      setQuotes(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setPage(targetPage);
    } catch {
      setError("Gagal memuat kutipan");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadQuotes(newPage);
  };

  const handleQuoteClick = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">{error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Kutipan Inspiratif</h1>
        <p className="mt-1.5 text-gray-500">
          Kumpulan kutipan dari tokoh-tokoh yang menginspirasi
        </p>
      </div>

      {/* List */}
      {quotes.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Belum ada kutipan. Silakan tambah dari panel admin.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {quotes.slice(0, 1).map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                featured
                onClick={() => handleQuoteClick(quote.id)}
              />
            ))}
            {quotes.slice(1).map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onClick={() => handleQuoteClick(quote.id)}
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
            showingLabel={`Menampilkan ${quotes.length} dari ${total} kutipan`}
          />
        </>
      )}
    </div>
  );
}