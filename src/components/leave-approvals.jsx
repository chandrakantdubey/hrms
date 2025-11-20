// src/components/approvals/LeaveApprovals.jsx

import React, { useState } from "react";
import { toast } from "sonner";
import {
  useLeaveRequests,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from "@/hooks/useEmployees";
import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RejectionDialog } from "@/components/rejection-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const LeaveApprovals = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  const {
    data: leaveData,
    isLoading,
    isError,
  } = useLeaveRequests({ page: currentPage, limit: 10 });
  const { mutate: approve, isPending: isApproving } = useApproveLeaveRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectLeaveRequest();
  const isActionPending = isApproving || isRejecting;

  const handleApprove = (request) => {
    approve(
      { employeeId: request.requestor.id, requestId: request.id },
      {
        onSuccess: () => toast.success("Leave request approved."),
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
          toast.success("Leave request rejected.");
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
    { key: "leave_type", header: "Leave Type", render: (lt) => lt.name },
    { key: "start_date", header: "From", render: formatDate },
    { key: "end_date", header: "To", render: formatDate },
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
        data={leaveData?.data?.leave_requests || []}
        pagination={leaveData?.data}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load leave requests." : null}
        emptyMessage="No pending leave requests found."
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
