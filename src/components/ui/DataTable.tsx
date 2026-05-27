import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "./Button";

export interface Column<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  width?: string;
}

export function DataTable<T>({
  rows,
  columns,
  onView,
  pageSize = 8
}: {
  rows: T[];
  columns: Array<Column<T>>;
  onView?: (row: T) => void;
  pageSize?: number;
}) {
  const safePageSize = Math.max(1, pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / safePageSize));
  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * safePageSize;

    return rows.slice(start, start + safePageSize);
  }, [currentPage, rows, safePageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length, safePageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="table-sticky min-w-full border-collapse text-left text-sm">
          <thead className="bg-paper text-xs font-semibold uppercase text-ink/55">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-line px-4 py-3" key={column.key} style={{ width: column.width }}>
                  {column.title}
                </th>
              ))}
              {onView && <th className="border-b border-line px-4 py-3">操作</th>}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr className="border-b border-line last:border-b-0 hover:bg-paper/70" key={(currentPage - 1) * safePageSize + index}>
                {columns.map((column) => (
                  <td className="whitespace-nowrap px-4 py-3 text-ink/80" key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
                {onView && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onView(row)}>
                        查看
                      </Button>
                      <Button size="sm" variant="ghost">
                        编辑
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-4 py-3 text-sm text-ink/60">
        <span>
          共 {rows.length} 条，第 {currentPage} / {totalPages} 页，本页 {visibleRows.length} 条
        </span>
        <div className="flex items-center gap-2">
          <Button disabled={currentPage <= 1} variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
            上一页
          </Button>
          <span className="rounded-md bg-ink px-3 py-1 text-xs font-semibold text-white">{currentPage}</span>
          <Button disabled={currentPage >= totalPages} variant="secondary" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
