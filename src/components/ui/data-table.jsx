import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

function DataTable({
  columns,
  data,
  pagination,
  onPageChange,
  loading = false,
  className,
  ...props
}) {
  const renderPaginationItems = () => {
    if (!pagination) return null

    const { current_page, last_page } = pagination
    const items = []

    // Calculate range of pages to show
    const maxVisiblePages = 5
    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(last_page, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={current_page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={current_page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Add ellipsis and last page if needed
    if (endPage < last_page) {
      if (endPage < last_page - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={last_page}>
          <PaginationLink
            onClick={() => onPageChange(last_page)}
            isActive={current_page === last_page}
          >
            {last_page}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
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
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.cellClassName}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((pagination.current_page - 1) * 10) + 1} to{" "}
            {Math.min(pagination.current_page * 10, pagination.total_record)} of{" "}
            {pagination.total_record} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.current_page - 1)}
                  className={
                    pagination.current_page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.current_page + 1)}
                  className={
                    pagination.current_page >= pagination.last_page
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export { DataTable }
