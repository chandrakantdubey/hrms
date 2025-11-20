// src/components/approvals/AttendanceApprovals.jsx

import React, { useState } from "react";
import { toast } from "sonner";
import {
  useAttendanceRequests,
  useApproveAttendanceRequest,
  useRejectAttendanceRequest,
} from "@/hooks/useEmployees";
import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RejectionDialog } from "@/components/rejection-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AttendanceApprovals = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  const {
    data: attendanceData,
    isLoading,
    isError,
  } = useAttendanceRequests({ page: currentPage, limit: 10 });
  const { mutate: approve, isPending: isApproving } =
    useApproveAttendanceRequest();
  const { mutate: reject, isPending: isRejecting } =
    useRejectAttendanceRequest();
  const isActionPending = isApproving || isRejecting;

  const handleApprove = (request) => {
    approve(
      { employeeId: request.requestor.id, requestId: request.id },
      {
        onSuccess: () => toast.success("Attendance request approved."),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to approve."),
      }
    );
  };

  const handleOpenRejectDialog = (request) => {
    setRejectionTarget(request);
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = (reason) => {
    if (!rejectionTarget) return;
    reject(
      {
        employeeId: rejectionTarget.requestor.id,
        requestId: rejectionTarget.id,
        reason,
      },
      {
        onSuccess: () => {
          toast.success("Attendance request rejected.");
          setRejectDialogOpen(false);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to reject."),
      }
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatType = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const formatTime = (time) =>
    time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  const columns = [
    {
      key: "requestor",
      header: "Employee",
      render: (requestor) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={requestor.profile_picture} />
            <AvatarFallback>{requestor.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{requestor.name}</div>
            <div className="text-xs text-muted-foreground">
              {requestor.employment.designation}
            </div>
          </div>
        </div>
      ),
    },
    { key: "date", header: "Date", render: formatDate },
    {
      key: "type",
      header: "Request Details",
      render: (type, row) => (
        <div>
          <div className="font-medium">{formatType(type)}</div>
          {row.new_check_in && (
            <div className="text-xs">In: {formatTime(row.new_check_in)}</div>
          )}
          {row.new_check_out && (
            <div className="text-xs">Out: {formatTime(row.new_check_out)}</div>
          )}
        </div>
      ),
    },
    { key: "reason", header: "Reason", cellClassName: "max-w-xs truncate" },
    {
      key: "actions",
      header: "Actions",
      width: "190px",
      cellClassName: "text-right",
      render: (_, row) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenRejectDialog(row)}
            disabled={isActionPending}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => handleApprove(row)}
            disabled={isActionPending}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={attendanceData?.data?.attendance_requests || []}
        pagination={attendanceData?.data}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load attendance requests." : null}
        emptyMessage="No pending attendance requests found."
      />
      <RejectionDialog
        open={isRejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onSubmit={handleRejectSubmit}
        isSubmitting={isRejecting}
      />
    </>
  );
};
