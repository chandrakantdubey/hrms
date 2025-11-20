// src/components/masters/PermissionGroupsMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  usePermissionGroups,
  useCreatePermissionGroup,
  useUpdatePermissionGroup,
  useDeletePermissionGroup,
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
import { Badge } from "@/components/ui/badge";

/**
 * Dialog Form for Creating and Editing Permission Groups
 */
const PermissionGroupFormDialog = ({ open, onClose, permissionGroup }) => {
  const { mutate: createGroup, isPending: isCreating } =
    useCreatePermissionGroup();
  const { mutate: updateGroup, isPending: isUpdating } =
    useUpdatePermissionGroup();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open) {
      reset(permissionGroup || { name: "" });
    }
  }, [permissionGroup, open, reset]);

  const onSubmit = (formData) => {
    // Note: The form only handles the group name. Permissions are managed in the Roles section.
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Permission Group ${
            permissionGroup ? "updated" : "created"
          } successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (permissionGroup) {
      updateGroup({ id: permissionGroup.id, ...formData }, mutationOptions);
    } else {
      createGroup(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {permissionGroup
              ? "Edit Permission Group"
              : "Create New Permission Group"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Group name is required." })}
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
              {isSubmitting ? "Saving..." : "Save Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Permission Groups master tab
 */
export const PermissionGroupsMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: groupsData,
    isLoading,
    isError,
  } = usePermissionGroups(currentPage, pageSize);
  const { mutate: deletePermissionGroup } = useDeletePermissionGroup();

  const handleOpenDialog = (group = null) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingGroup(null);
    setDialogOpen(false);
  };

  const handleDelete = (groupId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this permission group? This may affect assigned permissions."
      )
    ) {
      deletePermissionGroup(groupId, {
        onSuccess: () =>
          toast.success("Permission group deleted successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to delete group."),
      });
    }
  };

  const columns = [
    { key: "name", header: "Group Name" },
    {
      key: "permissions",
      header: "Permissions in this Group",
      render: (permissions) => (
        <div className="flex flex-wrap gap-1 max-w-lg">
          {permissions && permissions.length > 0 ? (
            permissions.map((p) => (
              <Badge key={p.id} variant="secondary">
                {p.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">No permissions</span>
          )}
        </div>
      ),
    },
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

  const permissionGroups = groupsData?.data || [];
  const pagination = groupsData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Group</Button>
      </div>

      <GenericTable
        columns={columns}
        data={permissionGroups}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load permission groups." : null}
        emptyMessage="No permission groups found."
      />

      <PermissionGroupFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        permissionGroup={editingGroup}
      />
    </div>
  );
};
