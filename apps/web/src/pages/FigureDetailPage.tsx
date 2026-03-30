import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { figuresApi, type FigureResponse } from "../lib/api/figures.ts";
import { ArrowLeft } from "iconoir-react/regular";

export function FigureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [figure, setFigure] = useState<FigureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadFigure(id);
    }
  }, [id]);

  const loadFigure = async (figureId: string) => {
    try {
      setLoading(true);
      const response = await figuresApi.getById(figureId);
      if (response.success && response.data) {
        setFigure(response.data);
      } else {
        setError("Tokoh tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat tokoh");
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

  if (error || !figure) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">{error || "Tokoh tidak ditemukan"}</p>
          <Link to="/figures" className="text-cyan-500 hover:text-cyan-600">
            ← Kembali ke tokoh inspiratif
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:max-w-3xl xl:max-w-4xl">
      <Link
        to="/figures"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-cyan-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke tokoh inspiratif
      </Link>

      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {figure.imageUrl && (
          <div className="relative h-64 md:h-80 w-full">
            <img
              src={figure.imageUrl}
              alt={figure.name}
              className="w-full h-full object-cover"
            />
            {figure.isFeatured && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Unggulan
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {figure.name}
            </h1>
            {figure.title && (
              <p className="text-lg text-cyan-600">{figure.title}</p>
            )}
          </div>

          {(figure.birthYear || figure.deathYear) && (
            <p className="text-gray-500 text-sm mb-4">
              {figure.birthYear || "?"} - {figure.deathYear || "Sekarang"}
            </p>
          )}

          {figure.bio && (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: figure.bio }}
            />
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Dipublikasikan pada {new Date(figure.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </article>
    </div>
  );
}