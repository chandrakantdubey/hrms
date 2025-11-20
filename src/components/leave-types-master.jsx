// src/components/masters/LeaveTypesMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from "@/hooks/useMasters";

import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

/**
 * Dialog Form for Creating and Editing Leave Types
 */
const LeaveTypeFormDialog = ({ open, onClose, leaveType }) => {
  const { mutate: createLeaveType, isPending: isCreating } =
    useCreateLeaveType();
  const { mutate: updateLeaveType, isPending: isUpdating } =
    useUpdateLeaveType();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", code: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(leaveType || { name: "", code: "", description: "" });
    }
  }, [leaveType, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Leave Type ${leaveType ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (leaveType) {
      updateLeaveType({ id: leaveType.id, ...formData }, mutationOptions);
    } else {
      createLeaveType(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {leaveType ? "Edit Leave Type" : "Create New Leave Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Leave Type Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              {...register("code", { required: "Code is required." })}
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Leave Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Leave Types master tab
 */
export const LeaveTypesMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  // Note: This hook does not use pagination according to your useMasters.js file
  const { data: leaveTypesData, isLoading, isError } = useLeaveTypes();
  const { mutate: deleteLeaveType } = useDeleteLeaveType();

  const handleOpenDialog = (leaveType = null) => {
    setEditingLeaveType(leaveType);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingLeaveType(null);
    setDialogOpen(false);
  };

  const handleDelete = (leaveTypeId) => {
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      deleteLeaveType(leaveTypeId, {
        onSuccess: () => toast.success("Leave type deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete leave type."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "code", header: "Code" },
    { key: "description", header: "Description" },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenDialog(row)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.id)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const leaveTypes = leaveTypesData?.data?.leave_types || [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Leave Type</Button>
      </div>

      <GenericTable
        columns={columns}
        data={leaveTypes}
        loading={isLoading}
        error={isError ? "Failed to load leave types." : null}
        emptyMessage="No leave types found."
        showPagination={false} // Data is not paginated from the hook
      />

      <LeaveTypeFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        leaveType={editingLeaveType}
      />
    </div>
  );
};
