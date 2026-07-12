import { buildPaginationItems } from "../../lib/pagination";

interface PortalQueriesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PortalQueriesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PortalQueriesPaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPaginationItems(currentPage, totalPages);
  const atStart = currentPage === 0;
  const atEnd = currentPage >= totalPages - 1;

  return (
    <nav className="portal-queries-pagination" aria-label="Strani poizvedb">
      <button
        type="button"
        className="portal-pagination__nav"
        disabled={atStart}
        onClick={() => onPageChange(0)}
      >
        « Začetek
      </button>
      <button
        type="button"
        className="portal-pagination__nav"
        disabled={atStart}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹ Nazaj
      </button>
      <span className="portal-pagination__status" aria-live="polite">
        Stran {currentPage + 1} od {totalPages}
      </span>
      <ol className="portal-pagination__pages">
        {items.map((item, index) =>
          item.type === "ellipsis" ? (
            <li key={`ellipsis-${index}`} className="portal-pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item.page}>
              <button
                type="button"
                className={`portal-pagination__page${
                  item.page === currentPage ? " portal-pagination__page--active" : ""
                }`}
                aria-current={item.page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(item.page)}
              >
                {item.page + 1}
              </button>
            </li>
          )
        )}
      </ol>
      <button
        type="button"
        className="portal-pagination__nav"
        disabled={atEnd}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Naprej ›
      </button>
      <button
        type="button"
        className="portal-pagination__nav"
        disabled={atEnd}
        onClick={() => onPageChange(totalPages - 1)}
      >
        Konec »
      </button>
    </nav>
  );
}
