// src/pages/Announcements.jsx

import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";
import { useSetPageTitle } from "@/contexts/PageTitleContext";

import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DatePickerComponent } from "@/components/ui/date-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  type: z.string().min(1, "Type is required"),
  start_date: z.date({ message: "Start date is required" }),
  end_date: z.date({ message: "End date is required" }),
});

/**
 * Dialog Form for Creating and Editing Announcements
 */
const AnnouncementFormDialog = ({ open, onClose, announcement }) => {
  const { mutate: createAnnouncement, isPending: isCreating } =
    useCreateAnnouncement();
  const { mutate: updateAnnouncement, isPending: isUpdating } =
    useUpdateAnnouncement();
  const isSubmitting = isCreating || isUpdating;

  // Helper function to convert date strings to Date objects
  const parseDate = (dateValue) => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };

  // --- FIX 2: Add `control` to the useForm destructuring ---
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "event",
      start_date: undefined,
      end_date: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (announcement) {
        reset({
          ...announcement,
          start_date: parseDate(announcement.start_date),
          end_date: parseDate(announcement.end_date),
        });
      } else {
        reset({
          title: "",
          body: "",
          type: "event",
          start_date: undefined,
          end_date: undefined,
        });
      }
    }
  }, [announcement, open, reset]);

  const onSubmit = (formData) => {
    // Format dates for API
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const payload = {
      title: formData.title,
      body: formData.body,
      type: formData.type,
      start_date: formatDate(formData.start_date),
      end_date: formatDate(formData.end_date),
    };

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Announcement ${announcement ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (announcement) {
      updateAnnouncement({ id: announcement.id, ...payload }, mutationOptions);
    } else {
      createAnnouncement(payload, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required." })}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              {...register("body", { required: "Body is required." })}
            />
            {errors.body && (
              <p className="text-sm text-red-500 mt-1">{errors.body.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              {/* --- FIX 3: Wrap Select in a Controller --- */}
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: "Start date is required." }}
                render={({ field }) => (
                  <DatePickerComponent
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    className="w-full"
                  />
                )}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Controller
                name="end_date"
                control={control}
                rules={{ required: "End date is required." }}
                render={({ field }) => (
                  <DatePickerComponent
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    className="w-full"
                  />
                )}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main page component for managing Announcements
 */
export default function Announcements() {
  // The rest of this component remains unchanged
  useSetPageTitle("Announcements");

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: announcementsData,
    isLoading,
    isError,
  } = useAnnouncements({ page: currentPage, limit: 10 });
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const handleOpenDialog = (announcement = null) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    setDialogOpen(false);
  };

  const handleDelete = (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement(announcementId, {
        onSuccess: () => toast.success("Announcement deleted successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to delete."),
      });
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const columns = [
    { key: "title", header: "Title", cellClassName: "font-medium" },
    {
      key: "type",
      header: "Type",
      cellClassName: "font-mdeium",
    },
    { key: "body", header: "Message", cellClassName: "max-w-sm truncate" },
    { key: "start_date", header: "Starts", render: formatDate },
    { key: "end_date", header: "Ends", render: formatDate },
    {
      key: "created_by",
      header: "Posted By",
      render: (creator) => creator?.name || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
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

  const announcements = announcementsData?.data?.announcements || [];
  const pagination = announcementsData?.data;

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={() => handleOpenDialog()}>New Announcement</Button>
        </div>

        <GenericTable
          columns={columns}
          data={announcements}
          pagination={pagination}
          onPageChange={setCurrentPage}
          loading={isLoading}
          error={isError ? "Failed to load announcements." : null}
          emptyMessage="No announcements found."
        />
      </div>

      <AnnouncementFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        announcement={editingAnnouncement}
      />
    </>
  );
}
