// src/components/tables/RegularizationRequestsTable.jsx

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GenericTable } from "@/components/ui/generic-table";
import { useUserAttendanceRequests } from "@/hooks/useUser"; // Make sure your hook handles pagination
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// You will pass the edit and delete handlers from the parent page
export function AttendanceRegularizationRequestsTable({
  onEditClick,
  onDeleteClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // NOTE: I'm assuming your useUserAttendanceRequests can take pagination params.
  // If not, you'll need to update it in useUser.js like we did for other hooks.
  const { data, isLoading, isError } = useUserAttendanceRequests({
    page: currentPage,
    limit: 10,
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatType = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (value) => formatDate(value),
    },
    {
      key: "type",
      header: "Request Type",
      render: (value) => formatType(value),
    },
    {
      key: "reason",
      header: "Reason",
      cellClassName: "max-w-xs truncate",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "approved_by",
      header: "Approved By",
      render: (_, row) =>
        row.approved_by?.name || row.rejected_by?.name || "N/A",
    },
    {
      id: "actions",

      width: "120px",

      headerClassName: "text-right",

      cellClassName: "text-right",
      header: "Actions",
      render: (_, row) => {
        // Only allow actions if the request is pending
        if (row.status === "pending") {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClick(row)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteClick(row.id)}
                  className="text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return null;
      },
    },
  ];

  if (isError) {
    return <div className="text-destructive p-4">Error loading requests.</div>;
  }

  return (
    <GenericTable
      columns={columns}
      data={data?.data?.attendance_requests || []}
      pagination={data?.data} // Pass the whole pagination object
      onPageChange={setCurrentPage}
      loading={isLoading}
      emptyMessage="No regularization requests found."
    />
  );
}
