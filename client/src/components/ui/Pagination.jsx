import { ChevronLeft, ChevronRight } from "lucide-react";

const getPageList = (current, total) => {
  const delta = 1;
  const range = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i += 1
  ) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");

  return [1, ...range, total];
};

export default function Pagination({ page, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-sm text-gray-600"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                p === page
                  ? "border border-gold-light/40 bg-gold-light/15 text-gold-300"
                  : "border border-transparent text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
