export type PaginationItem = { type: "page"; page: number } | { type: "ellipsis" };

/** 0-indexed strani; pri več straneh doda … okoli trenutne. */
export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
  maxAllPages = 9
): PaginationItem[] {
  if (totalPages <= 1) return [{ type: "page", page: 0 }];
  if (totalPages <= maxAllPages) {
    return Array.from({ length: totalPages }, (_, page) => ({ type: "page" as const, page }));
  }

  const pages = new Set<number>([0, totalPages - 1]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 0 && page < totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  let previous = -1;

  for (const page of sorted) {
    if (previous >= 0 && page - previous > 1) {
      items.push({ type: "ellipsis" });
    }
    items.push({ type: "page", page });
    previous = page;
  }

  return items;
}
