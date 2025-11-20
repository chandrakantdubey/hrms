import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { GenericTable } from "@/components/ui/generic-table";
import { useUserLeaveRequests } from "@/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Button } from "../ui/button";

function LeavesTable({ handleDelete, handleEdit }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { data, isLoading, error } = useUserLeaveRequests({
    page: currentPage,
    limit: 10,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatHalfDay = (isHalfDay, half) => {
    if (!isHalfDay) return "Full Day";
    return half === "first" ? "First Half" : "Second Half";
  };

  const columns = [
    {
      key: "leave_type",
      header: "Leave Type",
      render: (value) => (
        <div>
          <div className="font-medium">{value.name}</div>
          <div className="text-sm text-muted-foreground">{value.code}</div>
        </div>
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (value, row) => (
        <div>
          <div>{formatDate(value)}</div>
          <div className="text-sm text-muted-foreground">
            {formatHalfDay(row.start_is_half_day, row.start_half)}
          </div>
        </div>
      ),
    },
    {
      key: "end_date",
      header: "End Date",
      render: (value, row) => (
        <div>
          <div>{formatDate(value)}</div>
          <div className="text-sm text-muted-foreground">
            {formatHalfDay(row.end_is_half_day, row.end_half)}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (value, row) => {
        const { start_date, end_date, start_is_half_day, end_is_half_day } =
          row;

        // Calculate days difference
        const start = new Date(start_date);
        const end = new Date(end_date);
        let days =
          Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        // Adjust for half days
        if (start_is_half_day) days -= 0.5;
        if (end_is_half_day) days -= 0.5;

        // If both start and end are the same and both are half days, total should be 0.5
        if (start_date === end_date && start_is_half_day && end_is_half_day) {
          days = 0.5;
        }

        return <span>{days}</span>;
      },
    },
    {
      key: "reason",
      header: "Reason",
      render: (value) => (
        <div className="max-w-[200px] truncate" title={value}>
          {value}
        </div>
      ),
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
      render: (value) => (
        <div>
          {value ? (
            <>
              <div className="font-medium">{value.name}</div>
              {value.employment?.designation && (
                <div className="text-sm text-muted-foreground">
                  {value.employment.designation}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",

      width: "120px",

      headerClassName: "text-right",

      cellClassName: "text-right",
      header: "Actions",
      render: (value, row) => {
        const leaveRequest = row;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <EllipsisVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEdit(leaveRequest)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(leaveRequest.id)}
                className="text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading leave requests</p>
      </div>
    );
  }

  return (
    <GenericTable
      columns={columns}
      data={data?.data?.leave_requests || []}
      pagination={
        data?.data
          ? {
              current_page: data.data.current_page,
              last_page: data.data.last_page,
              total_record: data.data.total_record,
              filtered_total_record: data.data.filtered_total_record,
            }
          : null
      }
      onPageChange={handlePageChange}
      loading={isLoading}
      emptyMessage="No leave requests found"
    />
  );
}

export { LeavesTable };
