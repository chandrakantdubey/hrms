// src/components/masters/ShiftsMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

/**
 * Dialog Form for Creating and Editing Shifts
 */
const ShiftFormDialog = ({ open, onClose, shift }) => {
  const { mutate: createShift, isPending: isCreating } = useCreateShift();
  const { mutate: updateShift, isPending: isUpdating } = useUpdateShift();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", start_time: "", end_time: "" },
  });

  useEffect(() => {
    if (open) {
      reset(shift || { name: "", start_time: "", end_time: "" });
    }
  }, [shift, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(`Shift ${shift ? "updated" : "created"} successfully!`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (shift) {
      updateShift({ id: shift.id, ...formData }, mutationOptions);
    } else {
      createShift(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? "Edit Shift" : "Create New Shift"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Shift Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                {...register("start_time", {
                  required: "Start time is required.",
                })}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.start_time.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                {...register("end_time", { required: "End time is required." })}
              />
              {errors.end_time && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.end_time.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Shifts master tab
 */
export const ShiftsMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: shiftsData,
    isLoading,
    isError,
  } = useShifts(currentPage, 10);
  const { mutate: deleteShift } = useDeleteShift();

  const handleOpenDialog = (shift = null) => {
    setEditingShift(shift);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingShift(null);
    setDialogOpen(false);
  };

  const handleDelete = (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      deleteShift(shiftId, {
        onSuccess: () => toast.success("Shift deleted successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to delete shift."),
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    const date = new Date(1970, 0, 1, hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "start_time", header: "Start Time", render: formatTime },
    { key: "end_time", header: "End Time", render: formatTime },
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

  const shifts = shiftsData?.data?.shifts || [];
  const pagination = shiftsData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Shift</Button>
      </div>

      <GenericTable
        columns={columns}
        data={shifts}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load shifts." : null}
        emptyMessage="No shifts found."
      />

      <ShiftFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        shift={editingShift}
      />
    </div>
  );
};
