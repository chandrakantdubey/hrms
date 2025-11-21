// src/pages/Attendance.jsx

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { RegularizeAttendance } from "@/components/regularize-attendance"; // Your dialog component

import {
  useCreateUserAttendanceRequest,
  useUpdateUserAttendanceRequest,
  useDeleteUserAttendanceRequest,
  useDashboardOverview,
} from "@/hooks/useUser"; // Import all necessary hooks
import {
  AttendanceRegularizationRequestsTable,
  AttendanceTable,
} from "@/components/tables";
import { BarChart3, Clock, PieChart } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Attendance() {
  useSetPageTitle("Attendance");

  const {
    data,
    isLoading: isDashboardStatLoading,
    isError: isDashboardStatError,
  } = useDashboardOverview();

  const [isDialogOpen, setDialogOpen] = useState(false);
  // This state will hold data for both creating and editing requests
  const [editingData, setEditingData] = useState(null);

  // --- HOOKS FOR CRUD OPERATIONS ---
  const { mutate: createRequest, isPending: isCreating } =
    useCreateUserAttendanceRequest();
  const { mutate: updateRequest, isPending: isUpdating } =
    useUpdateUserAttendanceRequest();
  const { mutate: deleteRequest } = useDeleteUserAttendanceRequest();
  const isSubmitting = isCreating || isUpdating;

  // --- DIALOG AND FORM HANDLERS ---
  const handleOpenDialog = (data = null) => {
    setEditingData(data);
    setDialogOpen(true);
  };

  const handleDelete = (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      deleteRequest(requestId, {
        onSuccess: () => toast.success("Request deleted successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to delete."),
      });
    }
  };

  const handleFormSubmit = (payload) => {
    const isEditing = editingData?.id; // Check if we are editing an existing request

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Request ${isEditing ? "updated" : "submitted"} successfully!`
        );
        setDialogOpen(false);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "submit"} request.`;
        toast.error(message);
      },
    };

    if (isEditing) {
      updateRequest({ id: editingData.id, ...payload }, mutationOptions);
    } else {
      createRequest(payload, mutationOptions);
    }
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isDashboardStatLoading ? (
            [1, 2, 3, 4].map(() => <Skeleton className="h-[120px] w-full" />)
          ) : (
            <>
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Check In Time"
                value={data?.data?.check_in || "Not clocked in"}
                icon={Clock}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Check Out Time"
                value={data?.data?.check_out || "Not clocked out"}
                icon={Clock}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Attendance This Month"
                value={`${data?.data?.current_month_attendance || 0} Days`}
                icon={BarChart3}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Leave Balance"
                value={`${data?.data?.leave_balance || 0} Days`}
                icon={PieChart}
              />
            </>
          )}
        </div>
        <div className="flex justify-end items-center">
          <Button onClick={() => handleOpenDialog()}>
            Regularize Attendance
          </Button>
        </div>

        <Tabs defaultValue="my-attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="my-attendance">
              My Attendance
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="my-requests">
              My Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-attendance">
            <AttendanceTable onRegularizeClick={handleOpenDialog} />
          </TabsContent>

          <TabsContent value="my-requests">
            <AttendanceRegularizationRequestsTable
              onEditClick={handleOpenDialog}
              onDeleteClick={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* The Dialog component is used for both create and edit */}
      <RegularizeAttendance
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        attendanceData={editingData} // Pass the data to pre-fill the form
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
