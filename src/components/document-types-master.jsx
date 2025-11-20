// src/components/masters/DocumentTypesMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useDocumentTypes,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
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
import { Textarea } from "@/components/ui/textarea";
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
 * Dialog Form for Creating and Editing Document Types
 */
const DocumentTypeFormDialog = ({ open, onClose, documentType }) => {
  const { mutate: createDocumentType, isPending: isCreating } =
    useCreateDocumentType();
  const { mutate: updateDocumentType, isPending: isUpdating } =
    useUpdateDocumentType();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", description: "", is_mandatory: false },
  });

  useEffect(() => {
    if (open) {
      reset(documentType || { name: "", description: "", is_mandatory: false });
    }
  }, [documentType, open, reset]);

  const onSubmit = (formData) => {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Document Type ${documentType ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (documentType) {
      updateDocumentType({ id: documentType.id, ...formData }, mutationOptions);
    } else {
      createDocumentType(formData, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {documentType ? "Edit Document Type" : "Create New Document Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Document Name</Label>
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
          <div className="flex items-center space-x-2">
            <Controller
              name="is_mandatory"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is_mandatory"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_mandatory" className="cursor-pointer">
              This document is mandatory for employees
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Document Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for the Document Types master tab
 */
export const DocumentTypesMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: docTypesData,
    isLoading,
    isError,
  } = useDocumentTypes(currentPage, pageSize);
  const { mutate: deleteDocumentType } = useDeleteDocumentType();

  const handleOpenDialog = (docType = null) => {
    setEditingDocType(docType);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingDocType(null);
    setDialogOpen(false);
  };

  const handleDelete = (docTypeId) => {
    if (window.confirm("Are you sure you want to delete this document type?")) {
      deleteDocumentType(docTypeId, {
        onSuccess: () => toast.success("Document type deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete document type."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "description", header: "Description" },
    {
      key: "is_mandatory",
      header: "Mandatory",
      render: (isMandatory) =>
        isMandatory ? (
          <Badge>Yes</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
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

  const documentTypes = docTypesData?.data?.document_types || [];
  const pagination = docTypesData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          Add New Document Type
        </Button>
      </div>

      <GenericTable
        columns={columns}
        data={documentTypes}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load document types." : null}
        emptyMessage="No document types found."
      />

      <DocumentTypeFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        documentType={editingDocType}
      />
    </div>
  );
};
