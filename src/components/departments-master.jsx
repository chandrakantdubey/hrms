// src/components/masters/DepartmentsMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
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
 * Dialog Form for Creating and Editing Departments
 */
const DepartmentFormDialog = ({ open, onClose, department }) => {
  const { mutate: createDepartment, isPending: isCreating } =
    useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } =
    useUpdateDepartment();
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
      reset(department || { name: "", code: "", description: "" });
    }
  }, [department, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Department ${department ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (department) {
      updateDepartment({ id: department.id, ...formData }, mutationOptions);
    } else {
      createDepartment(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create New Department"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="code">Department Code</Label>
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
              {isSubmitting ? "Saving..." : "Save Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Departments master tab
 */
export const DepartmentsMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: departmentsData,
    isLoading,
    isError,
  } = useDepartments(currentPage, pageSize);
  const { mutate: deleteDepartment } = useDeleteDepartment();

  const handleOpenDialog = (department = null) => {
    setEditingDepartment(department);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingDepartment(null);
    setDialogOpen(false);
  };

  const handleDelete = (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      deleteDepartment(departmentId, {
        onSuccess: () => toast.success("Department deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete department."
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

  const departments = departmentsData?.data?.departments || [];
  const pagination = departmentsData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Department</Button>
      </div>

      <GenericTable
        columns={columns}
        data={departments}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load departments." : null}
        emptyMessage="No departments found."
      />

      <DepartmentFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        department={editingDepartment}
      />
    </div>
  );
};
