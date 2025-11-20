// src/components/masters/DesignationsMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useDesignations,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
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
 * Dialog Form for Creating and Editing Designations
 */
const DesignationFormDialog = ({ open, onClose, designation }) => {
  const { mutate: createDesignation, isPending: isCreating } =
    useCreateDesignation();
  const { mutate: updateDesignation, isPending: isUpdating } =
    useUpdateDesignation();
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
      reset(designation || { name: "", description: "" });
    }
  }, [designation, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Designation ${designation ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (designation) {
      updateDesignation({ id: designation.id, ...formData }, mutationOptions);
    } else {
      createDesignation(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {designation ? "Edit Designation" : "Create New Designation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Designation Name</Label>
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
              {isSubmitting ? "Saving..." : "Save Designation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Designations master tab
 */
export const DesignationsMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: designationsData,
    isLoading,
    isError,
  } = useDesignations(currentPage, pageSize);
  const { mutate: deleteDesignation } = useDeleteDesignation();

  const handleOpenDialog = (designation = null) => {
    setEditingDesignation(designation);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingDesignation(null);
    setDialogOpen(false);
  };

  const handleDelete = (designationId) => {
    if (window.confirm("Are you sure you want to delete this designation?")) {
      deleteDesignation(designationId, {
        onSuccess: () => toast.success("Designation deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete designation."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Name" },
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

  const designations = designationsData?.data?.designations || [];
  const pagination = designationsData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Designation</Button>
      </div>

      <GenericTable
        columns={columns}
        data={designations}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load designations." : null}
        emptyMessage="No designations found."
      />

      <DesignationFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        designation={editingDesignation}
      />
    </div>
  );
};
