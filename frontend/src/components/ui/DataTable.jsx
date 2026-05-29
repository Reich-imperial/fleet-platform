import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function DataTable({ columns, data = [], page = 1, pageSize = 8, onRowClick }) {
  const [sort, setSort] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sort.key) return data;

    return [...data].sort((a, b) => {
      const first = a[sort.key] ?? '';
      const second = b[sort.key] ?? '';
      const result = String(first).localeCompare(String(second), undefined, { numeric: true });
      return sort.direction === 'asc' ? result : -result;
    });
  }, [data, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const rows = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (column) => {
    if (!column.sortable) return;
    setSort((current) => ({
      key: column.key,
      direction: current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="overflow-hidden rounded-card border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface-strong)]">
            <tr className="border-b border-[var(--color-line)]">
              {columns.map((column) => {
                const active = sort.key === column.key;
                const SortIcon = sort.direction === 'asc' ? ArrowUp : ArrowDown;

                return (
                  <th
                    key={column.key}
                    className="h-10 whitespace-nowrap px-3 text-left text-[11px] font-medium uppercase tracking-[0] text-[var(--color-muted)]"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => onSort(column)}
                      disabled={!column.sortable}
                    >
                      {column.header}
                      {column.sortable && active ? <SortIcon size={12} /> : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                onClick={() => onRowClick?.(row)}
                className={[
                  'h-10 border-b border-[var(--color-line)] last:border-b-0',
                  index % 2 ? 'bg-[var(--color-surface-strong)]' : 'bg-[var(--color-surface)]',
                  onRowClick ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 text-[var(--color-ink)]">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex h-10 items-center justify-between border-t border-[var(--color-line)] bg-[var(--color-surface-strong)] px-3 text-[11px] text-[var(--color-muted)]">
        <span>{sortedData.length} records</span>
        <span>
          Page {page} of {pageCount}
        </span>
      </div>
    </div>
  );
}
