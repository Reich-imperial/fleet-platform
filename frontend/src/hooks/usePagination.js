import { useMemo, useState } from 'react';

export const usePagination = (total = 0, initialPageSize = 8) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  return {
    page,
    pageSize,
    pageCount,
    setPage,
    setPageSize,
    nextPage: () => setPage((value) => Math.min(pageCount, value + 1)),
    previousPage: () => setPage((value) => Math.max(1, value - 1)),
    resetPage: () => setPage(1),
  };
};
