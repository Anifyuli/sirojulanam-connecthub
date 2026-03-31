import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { figuresApi, type FigureResponse } from "../lib/api/figures.ts";
import { FigureCard } from "../components/FigureCard.tsx";
import { Pagination } from "../components/Pagination.tsx";

export function FiguresPage() {
  const navigate = useNavigate();
  const [figures, setFigures] = useState<FigureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadFigures(1);
  }, []);

  const loadFigures = async (targetPage: number) => {
    try {
      setLoading(true);
      const response = await figuresApi.getAll({
        isPublished: true,
        page: targetPage,
        limit: 10,
      });

      setFigures(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setPage(targetPage);
    } catch {
      setError("Gagal memuat tokoh inspiratif");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadFigures(newPage);
  };

  const handleFigureClick = (figureId: string) => {
    navigate(`/figures/${figureId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error && figures.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">{error}</div>
    );
  }

  const getInterleavedFigures = () => {
    const featured = figures.filter((f) => f.isFeatured);
    const rest = figures.filter((f) => !f.isFeatured);
    
    const result: { type: "featured" | "rest"; figures: FigureResponse[] }[] = [];
    let featuredIdx = 0;
    let restIdx = 0;
    let isFeaturedRow = true;

    while (featuredIdx < featured.length || restIdx < rest.length) {
      if (isFeaturedRow && featuredIdx < featured.length) {
        result.push({ type: "featured", figures: [featured[featuredIdx]] });
        featuredIdx++;
      } else if (!isFeaturedRow && restIdx < rest.length) {
        const pair = rest.slice(restIdx, restIdx + 2);
        result.push({ type: "rest", figures: pair });
        restIdx += pair.length;
      } else if (featuredIdx < featured.length) {
        result.push({ type: "featured", figures: [featured[featuredIdx]] });
        featuredIdx++;
      } else if (restIdx < rest.length) {
        const pair = rest.slice(restIdx, restIdx + 2);
        result.push({ type: "rest", figures: pair });
        restIdx += pair.length;
      }
      isFeaturedRow = !isFeaturedRow;
    }

    return result;
  };

  const interleaved = getInterleavedFigures();

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Tokoh Inspiratif</h1>
        <p className="mt-1.5 text-gray-500">
          Profil tokoh-tokoh yang menginspirasi umat
        </p>
      </div>

      {figures.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Belum ada tokoh. Silakan tambah dari panel admin.
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {interleaved.map((row, idx) => (
              row.type === "featured" ? (
                row.figures.map((figure) => (
                  <FigureCard
                    key={figure.id}
                    figure={figure}
                    featured
                    onClick={() => handleFigureClick(figure.id)}
                  />
                ))
              ) : (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {row.figures.map((figure) => (
                    <FigureCard
                      key={figure.id}
                      figure={figure}
                      onClick={() => handleFigureClick(figure.id)}
                    />
                  ))}
                </div>
              )
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
            showingLabel={`Menampilkan ${figures.length} dari ${total} tokoh`}
          />
        </>
      )}
    </div>
  );
}