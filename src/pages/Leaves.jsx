import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { LeavesTable } from "@/components/tables/leaves-table";
import {
  useDashboardOverview,
  useDeleteUserLeaveRequest,
} from "@/hooks/useUser";
import { CalendarDays, CheckCircle2, HelpCircle, PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LeaveRequestModal } from "@/components/leave-request-modal";

export default function Leaves() {
  useSetPageTitle("Leaves");
  const {
    data,
    isLoading: isDashboardStatLoading,
    isError: isDashboardStatError,
    refetch,
  } = useDashboardOverview();
  const {
    mutate: deleteLeaveRequest,
    isPending: isDeleting,
    isError,
    error,
  } = useDeleteUserLeaveRequest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(undefined);

  const handleApply = () => {
    setSelectedLeaveRequest(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (leaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLeaveRequest(undefined);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      deleteLeaveRequest(id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isDashboardStatLoading ? (
          [1, 2, 3, 4].map(() => <Skeleton className="h-[120px] w-full" />)
        ) : (
          <>
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Leave Balance"
              value={`${data?.data?.leave_balance || 0} Days`}
              icon={PieChart}
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Total Requests"
              value={data?.data?.total_leave_requests || 0}
              icon={CalendarDays}
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Approved Requests"
              value={data?.data?.approved_leave_requests || 0}
              icon={CheckCircle2}
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Pending Requests"
              value={data?.data?.pending_leave_requests || 0}
              icon={HelpCircle}
            />
          </>
        )}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleApply}>Apply Leave</Button>
      </div>
      <LeavesTable handleEdit={handleEdit} handleDelete={handleDelete} />

      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        leaveRequest={selectedLeaveRequest}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
