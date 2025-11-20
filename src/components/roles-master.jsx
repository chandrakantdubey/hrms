import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissionGroups,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

/**
 * Dialog Form for Creating and Editing Roles
 */
const RoleFormDialog = ({ open, onClose, role }) => {
  const { data: permissionGroupsData, isLoading: isLoadingPermissions } =
    usePermissionGroups(1, 1000);
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      permissions: [], // This will now be an array of strings (permission names)
    },
  });

  // Effect to reset the form when the 'role' prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (role) {
        // *** UPDATED ***
        // When editing, populate the form's permissions array with names instead of IDs.
        reset({
          name: role.name,
          permissions: role.permissions?.map((p) => p.name) || [],
        });
      } else {
        // When creating, reset to default empty values
        reset({ name: "", permissions: [] });
      }
    }
  }, [role, open, reset]);

  const onSubmit = (formData) => {
    // formData.permissions is now already an array of strings, which is the correct format.
    const payload = {
      name: formData.name,
      permissions: formData.permissions || [],
    };

    const mutationOptions = {
      onSuccess: () => {
        toast.success(`Role ${role ? "updated" : "created"} successfully!`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (role) {
      updateRole({ id: role.id, ...payload }, mutationOptions);
    } else {
      createRole(payload, mutationOptions);
    }
  };

  const permissionGroups = permissionGroupsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[450px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Update the details for this role."
              : "Fill in the details to create a new role."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Role name is required." })}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="mt-2 space-y-4">
                {isLoadingPermissions ? (
                  <p>Loading permissions...</p>
                ) : (
                  permissionGroups.map((group) => (
                    <div key={group.id}>
                      <h4 className="font-semibold mb-2 capitalize">
                        {group.name}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {group.permissions.map((permission) => (
                          <Controller
                            key={permission.id}
                            name="permissions"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permission.id}`}
                                  // *** UPDATED ***
                                  // Check if the permission NAME is in the value array
                                  checked={field.value?.includes(
                                    permission.name
                                  )}
                                  onCheckedChange={(checked) => {
                                    // *** UPDATED ***
                                    // Add or remove the permission NAME from the array
                                    const newValue = checked
                                      ? [...field.value, permission.name]
                                      : field.value.filter(
                                          (name) => name !== permission.name
                                        );
                                    field.onChange(newValue);
                                  }}
                                />
                                <label
                                  htmlFor={`perm-${permission.id}`}
                                  className="text-sm cursor-pointer capitalize"
                                >
                                  {permission.name}
                                </label>
                              </div>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Roles master tab
 */
export const RolesMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const { data: rolesData, isLoading, isError } = useRoles();
  const { mutate: deleteRole } = useDeleteRole();

  const handleOpenDialog = (role = null) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRole(null);
    setDialogOpen(false);
  };

  const handleDelete = (roleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      deleteRole(roleId, {
        onSuccess: () => toast.success("Role deleted successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to delete role."),
      });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (name) => <span className="capitalize">{name}</span>,
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (permissions) => (
        <div className="flex flex-wrap gap-1 max-w-lg">
          {permissions && permissions.length > 0 ? (
            permissions.map((p) => (
              <span
                key={p.id}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full capitalize"
              >
                {p.name}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">No permissions</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      width: "120px",
      headerClassName: "text-right",
      cellClassName: "text-right",
      header: "Actions",
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

  const roles = rolesData?.data?.roles || [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Role</Button>
      </div>

      <GenericTable
        columns={columns}
        data={roles}
        loading={isLoading}
        error={isError ? "Failed to load roles." : null}
        emptyMessage="No roles found."
        showPagination={false}
      />

      <RoleFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        role={editingRole}
      />
    </div>
  );
};
