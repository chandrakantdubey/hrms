import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function GenericTable({
  columns,
  data,
  pagination,
  onPageChange,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className,
  pageSize = 10,
  showPagination = true,
  ...props
}) {
  const renderPaginationItems = () => {
    if (!pagination || !showPagination) return null;

    const { current_page, last_page } = pagination;
    const items = [];

    // Calculate range of pages to show
    const maxVisiblePages = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <li key="1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            className={cn(
              "size-8",
              current_page === 1 && "bg-primary text-primary-foreground"
            )}
          >
            1
          </Button>
        </li>
      );
      if (startPage > 2) {
        items.push(
          <li key="ellipsis-start" className="flex items-center">
            <MoreHorizontal className="size-4" />
          </li>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(i)}
            className={cn(
              "size-8",
              current_page === i && "bg-primary text-primary-foreground"
            )}
          >
            {i}
          </Button>
        </li>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < last_page) {
      if (endPage < last_page - 1) {
        items.push(
          <li key="ellipsis-end" className="flex items-center">
            <MoreHorizontal className="size-4" />
          </li>
        );
      }
      items.push(
        <li key={last_page}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(last_page)}
            className={cn(
              "size-8",
              current_page === last_page && "bg-primary text-primary-foreground"
            )}
          >
            {last_page}
          </Button>
        </li>
      );
    }

    return items;
  };

  const calculateItemsShown = () => {
    if (!pagination) return { start: 0, end: data.length, total: data.length };

    const start = (pagination.current_page - 1) * pageSize + 1;
    const end = Math.min(
      pagination.current_page * pageSize,
      pagination.total_record
    );
    const total = pagination.total_record || data.length;

    return { start, end, total };
  };

  const { start, end, total } = calculateItemsShown();

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={column.key || index}
                  className={cn(column.headerClassName)}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`${row.id || index}-${column.key || colIndex}`}
                      className={cn(column.cellClassName)}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {start} to {end} of {total} entries
            {pagination.filtered_total_record &&
              pagination.filtered_total_record !== pagination.total_record && (
                <span>
                  {" "}
                  (filtered from {pagination.total_record} total entries)
                </span>
              )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <ul className="flex items-center gap-1">
              {renderPaginationItems()}
            </ul>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { GenericTable };
