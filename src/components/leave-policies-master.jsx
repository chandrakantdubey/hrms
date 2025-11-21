// src/components/masters/LeavePoliciesMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useLeavePolicies,
  useCreateLeavePolicy,
  useUpdateLeavePolicy,
  useDeleteLeavePolicy,
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
 * Dialog Form for Creating and Editing Leave Policies
 */
const LeavePolicyFormDialog = ({ open, onClose, leavePolicy }) => {
  const { mutate: createLeavePolicy, isPending: isCreating } =
    useCreateLeavePolicy();
  const { mutate: updateLeavePolicy, isPending: isUpdating } =
    useUpdateLeavePolicy();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(leavePolicy || { name: "", description: "" });
    }
  }, [leavePolicy, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Leave Policy ${leavePolicy ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (leavePolicy) {
      updateLeavePolicy({ id: leavePolicy.id, ...formData }, mutationOptions);
    } else {
      createLeavePolicy(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {leavePolicy ? "Edit Leave Policy" : "Create New Leave Policy"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Policy Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
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
              {isSubmitting ? "Saving..." : "Save Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Leave Policies master tab
 */
export const LeavePoliciesMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingLeavePolicy, setEditingLeavePolicy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: leavePoliciesData,
    isLoading,
    isError,
  } = useLeavePolicies(currentPage, 10);
  const { mutate: deleteLeavePolicy } = useDeleteLeavePolicy();

  const handleOpenDialog = (leavePolicy = null) => {
    setEditingLeavePolicy(leavePolicy);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingLeavePolicy(null);
    setDialogOpen(false);
  };

  const handleDelete = (leavePolicyId) => {
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      deleteLeavePolicy(leavePolicyId, {
        onSuccess: () => toast.success("Leave policy deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete leave policy."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Policy Name" },
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

  const leavePolicies = leavePoliciesData?.data?.leave_policies || [];
  const pagination = leavePoliciesData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Leave Policy</Button>
      </div>

      <GenericTable
        columns={columns}
        data={leavePolicies}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load leave policies." : null}
        emptyMessage="No leave policies found."
      />

      <LeavePolicyFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        leavePolicy={editingLeavePolicy}
      />
    </div>
  );
};
