// src/components/masters/PermissionsMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
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
 * Dialog Form for Creating and Editing Permissions
 */
const PermissionFormDialog = ({ open, onClose, permission }) => {
  const { mutate: createPermission, isPending: isCreating } =
    useCreatePermission();
  const { mutate: updatePermission, isPending: isUpdating } =
    useUpdatePermission();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "" },
  });

  // Effect to reset the form when the 'permission' prop changes
  useEffect(() => {
    if (open) {
      reset({ name: permission?.name || "" });
    }
  }, [permission, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Permission ${permission ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (permission) {
      updatePermission({ id: permission.id, ...formData }, mutationOptions);
    } else {
      createPermission(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {permission ? "Edit Permission" : "Create New Permission"}
          </DialogTitle>
          <DialogDescription>
            {permission
              ? "Update the name for this permission."
              : "Provide a name for the new permission."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Permission Name</Label>
            <Input
              id="name"
              {...register("name", {
                required: "Permission name is required.",
              })}
              className="mt-1"
              placeholder="e.g., view_reports"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Permissions master tab
 */
export const PermissionsMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: permissionsData,
    isLoading,
    isError,
  } = usePermissions(currentPage, 10);
  const { mutate: deletePermission } = useDeletePermission();

  const handleOpenDialog = (permission = null) => {
    setEditingPermission(permission);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingPermission(null);
    setDialogOpen(false);
  };

  const handleDelete = (permissionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this permission? This can affect user roles."
      )
    ) {
      deletePermission(permissionId, {
        onSuccess: () => toast.success("Permission deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete permission."
          ),
      });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
    },
    // {
    //   key: "created_at",
    //   header: "Created On",
    //   render: (dateString) => new Date(dateString).toLocaleDateString(),
    // },
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

  const permissions = permissionsData?.data?.permissions || [];
  const pagination = permissionsData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Permission</Button>
      </div>

      <GenericTable
        columns={columns}
        data={permissions}
        pagination={pagination}
        onPageChange={setCurrentPage}
        // If your GenericTable supports changing page size, you can add:
        // onPageSizeChange={setPageSize}
        loading={isLoading}
        error={isError ? "Failed to load permissions." : null}
        emptyMessage="No permissions found."
      />

      <PermissionFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        permission={editingPermission}
      />
    </div>
  );
};
