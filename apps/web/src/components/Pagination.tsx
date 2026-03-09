import { ArrowLeft, ArrowRight } from "iconoir-react/regular";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  showingLabel?: string;
}

export function Pagination({
  pagination,
  onPageChange,
  showingLabel,
}: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <>
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className={`
            flex h-10 w-10 items-center justify-center rounded-lg
            font-medium transition-all duration-200
            ${pagination.currentPage === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 active:bg-cyan-300"
            }
          `}
        >
          <ArrowLeft />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  flex h-10 w-10 items-center justify-center rounded-lg
                  font-medium transition-all duration-200
                  ${pagination.currentPage === page
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                  }
                `}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className={`
            flex h-10 w-10 items-center justify-center rounded-lg
            font-medium transition-all duration-200
            ${pagination.currentPage === pagination.totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 active:bg-cyan-300"
            }
          `}
        >
          <ArrowRight />
        </button>
      </div>

      {showingLabel && (
        <p className="mt-4 text-center text-sm text-gray-500">{showingLabel}</p>
      )}
    </>
  );
}
