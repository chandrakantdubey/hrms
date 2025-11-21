// src/components/masters/HolidaysMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
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
import { DatePickerComponent } from "@/components/ui/date-picker";
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
 * Dialog Form for Creating and Editing Holidays
 */
const HolidayFormDialog = ({ open, onClose, holiday }) => {
  const { mutate: createHoliday, isPending: isCreating } = useCreateHoliday();
  const { mutate: updateHoliday, isPending: isUpdating } = useUpdateHoliday();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", date: undefined, description: "" },
  });

  useEffect(() => {
    if (open) {
      if (holiday) {
        reset({
          ...holiday,
          date: holiday.date ? new Date(holiday.date) : undefined,
        });
      } else {
        reset({ name: "", date: undefined, description: "" });
      }
    }
  }, [holiday, open, reset]);

  const onSubmit = (formData) => {
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const payload = {
      ...formData,
      date: formatDate(formData.date),
    };

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Holiday ${holiday ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (holiday) {
      updateHoliday({ id: holiday.id, ...payload }, mutationOptions);
    } else {
      createHoliday(payload, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {holiday ? "Edit Holiday" : "Create New Holiday"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required." }}
              render={({ field }) => (
                <DatePickerComponent
                  id="date"
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                />
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
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
              {isSubmitting ? "Saving..." : "Save Holiday"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Holidays master tab
 */
export const HolidaysMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: holidaysData,
    isLoading,
    isError,
  } = useHolidays(currentPage, 10);
  const { mutate: deleteHoliday } = useDeleteHoliday();

  const handleOpenDialog = (holiday = null) => {
    setEditingHoliday(holiday);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingHoliday(null);
    setDialogOpen(false);
  };

  const handleDelete = (holidayId) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      deleteHoliday(holidayId, {
        onSuccess: () => toast.success("Holiday deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete holiday."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Holiday" },
    {
      key: "date",
      header: "Date",
      render: (dateString) =>
        new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    },
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

  const holidays = holidaysData?.data?.holidays || [];
  const pagination = holidaysData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Holiday</Button>
      </div>

      <GenericTable
        columns={columns}
        data={holidays}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load holidays." : null}
        emptyMessage="No holidays found."
      />

      <HolidayFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        holiday={editingHoliday}
      />
    </div>
  );
};
