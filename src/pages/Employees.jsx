// src/pages/Employees.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useMasters";

import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadEmployeesDialog } from "@/components/upload-employees-dialog";

export default function Employees() {
  useSetPageTitle("Employees");
  const navigate = useNavigate();

  // State management for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Empty string for "All"
  const [isUploadOpen, setUploadOpen] = useState(false);

  // Debounce search input to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetching data
  const {
    data: employeesData,
    isLoading,
    isError,
  } = useEmployees({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm,
    department_id: selectedDepartment || undefined, // Send undefined if empty
  });
  const { data: departmentsData } = useDepartments(1, 1000); // Fetch all departments for filter

  const handleRowClick = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={row.profile?.profile_image_url}
              alt={row.profile?.first_name}
            />
            <AvatarFallback>
              {row.profile?.first_name?.[0]}
              {row.profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {row.profile?.first_name} {row.profile?.last_name}
            </div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: "employment.code", header: "Emp. Code" },
    { key: "employment.designation.name", header: "Designation" },
    { key: "employment.status", header: "Status" },
  ];

  const employees = employeesData?.data?.employees || [];
  const pagination = employeesData?.data;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <div>
          <Button onClick={() => navigate("/add-employee")}>
            Add
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            Import
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search by name or employee code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedDepartment}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="*">All Departments</SelectItem>
            {departmentsData?.data?.departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <GenericTable
        columns={columns}
        data={employees}
        pagination={pagination}
        onPageChange={setCurrentPage}
        loading={isLoading}
        error={isError ? "Failed to load employees." : null}
        emptyMessage="No employees found."
        onRowClick={handleRowClick}
      />
      <UploadEmployeesDialog open={isUploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
