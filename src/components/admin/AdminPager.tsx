/** Majhen skupni pager za admin sezname. */
export function AdminPager({
  page,
  totalPages,
  total,
  pageSize,
  loading,
  label,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  loading?: boolean;
  label: string;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <nav className="admin-pagination" aria-label={label}>
      <button
        type="button"
        className="btn"
        disabled={loading || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Nazaj
      </button>
      <div className="admin-pagination__pages">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            className={`btn admin-pagination__num${n === page ? " is-active" : ""}`}
            disabled={loading || n === page}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn"
        disabled={loading || page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Naprej
      </button>
    </nav>
  );
}
