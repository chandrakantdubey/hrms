import { Badge } from "@/components/ui/badge";
import { GenericTable } from "@/components/ui/generic-table";
import { useGetAttendances } from "@/hooks/useUser";
import { useState } from "react";
import { Button } from "../ui/button";

function AttendanceTable({ onRegularizeClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useGetAttendances({
    page: currentPage,
    limit: 10,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "present":
        return "default";
      case "absent":
        return "destructive";
      case "late":
        return "secondary";
      case "half_day":
        return "outline";
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

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (value) => formatDate(value),
      width: "120px",
    },
    {
      key: "check_in",
      header: "Check In",
      render: (value) => formatTime(value),
      width: "100px",
    },
    {
      key: "check_out",
      header: "Check Out",
      render: (value) => formatTime(value),
      width: "100px",
    },
    {
      key: "working_hours",
      header: "Working Hours",
      render: (value, row) => calculateDuration(row.check_in, row.check_out),
      width: "100px",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value?.replace("_", " ")}
        </Badge>
      ),
      width: "100px",
    },

    {
      key: "actions",

      width: "120px",

      headerClassName: "text-right",

      cellClassName: "text-right",
      header: "Actions",
      render: (_, row) => {
        if (+row?.working_hours < 8.5) {
          return (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegularizeClick(row)}
                className="max-w-24"
              >
                Regularize
              </Button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading attendance records</p>
      </div>
    );
  }

  return (
    <GenericTable
      columns={columns}
      data={data?.data?.attendances || []}
      pagination={
        data?.data?.last_page > data?.data?.current_page
          ? {
              current_page: data?.data?.current_page,
              last_page: data?.data?.last_page,
              total_record: data?.data?.total_record,
              filtered_total_record: data?.data?.filtered_total_record,
            }
          : null
      }
      onPageChange={handlePageChange}
      loading={isLoading}
      emptyMessage="No attendance records found"
    />
  );
}

export { AttendanceTable };
