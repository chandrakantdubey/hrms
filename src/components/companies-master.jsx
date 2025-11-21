// src/components/masters/CompaniesMaster.jsx

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
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
import { DatePickerComponent } from "@/components/ui/date-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone_no: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  established_date: z.date().optional(),
});

/**
 * Dialog Form for Creating and Editing Companies
 */
const CompanyFormDialog = ({ open, onClose, company }) => {
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const isSubmitting = isCreating || isUpdating;

  // Helper function to convert date strings to Date objects
  const parseDate = (dateValue) => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      website: "",
      address: "",
      description: "",
      established_date: undefined,
    },
  });

  // Effect to reset form when the 'company' prop or dialog visibility changes
  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          ...company,
          established_date: parseDate(company.established_date),
        });
      } else {
        reset({
          name: "",
          email: "",
          phone_no: "",
          website: "",
          address: "",
          description: "",
          established_date: undefined,
        });
      }
    }
  }, [company, open, reset]);

  const onSubmit = (formData) => {
    // Format date for API
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    // Filter out empty string values to send null to the API if desired
    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    // Format established_date
    payload.established_date = formatDate(formData.established_date);

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          `Company ${company ? "updated" : "created"} successfully!`
        );
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred.");
      },
    };

    if (company) {
      updateCompany({ id: company.id, ...payload }, mutationOptions);
    } else {
      createCompany(payload, mutationOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? "Edit Company" : "Create New Company"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required." })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div>
              <Label htmlFor="phone_no">Phone Number</Label>
              <Input id="phone_no" {...register("phone_no")} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register("address")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <div>
              <Label htmlFor="established_date">Established Date</Label>
              <Controller
                name="established_date"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select established date"
                    className="w-full"
                  />
                )}
              />
              {errors.established_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.established_date.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
};

/**
 * Main component for the Companies master tab
 */
export const CompaniesMaster = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: companiesData,
    isLoading,
    isError,
  } = useCompanies(currentPage, pageSize);
  const { mutate: deleteCompany } = useDeleteCompany();

  const handleOpenDialog = (company = null) => {
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCompany(null);
    setDialogOpen(false);
  };

  const handleDelete = (companyId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? This may affect associated employees."
      )
    ) {
      deleteCompany(companyId, {
        onSuccess: () => toast.success("Company deleted successfully!"),
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to delete company."
          ),
      });
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone_no", header: "Phone" },
    {
      key: "website",
      header: "Website",
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {url}
          </a>
        ) : (
          "-"
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

  const companies = companiesData?.data?.companies || [];
  const pagination = companiesData?.data;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>Add New Company</Button>
      </div>

      <GenericTable
        columns={columns}
        data={companies}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load companies." : null}
        emptyMessage="No companies found."
      />

      <CompanyFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        company={editingCompany}
      />
    </div>
  );
};
