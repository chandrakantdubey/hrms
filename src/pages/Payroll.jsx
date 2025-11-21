import React, { useState } from "react";
import { toast } from "sonner";
import { useEmployeePayrolls, useDownloadPayroll } from "@/hooks/useEmployees";
import { useSetPageTitle } from "@/contexts/PageTitleContext";

import { GenericTable } from "@/components/ui/generic-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload } from "lucide-react";
import { UploadPayrollDialog } from "@/components/upload-payroll-dilog";
import { Badge } from "@/components/ui/badge";

// Helper to generate months and years
const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
}));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function Payroll() {
  useSetPageTitle("Payroll");

  // State for filters and dialog
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(currentYear);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadOpen, setUploadOpen] = useState(false);

  // Data fetching and mutation hooks
  const {
    data: payrollData,
    isLoading,
    isError,
  } = useEmployeePayrolls({
    month,
    year,
    page: currentPage,
    limit: 10,
  });
  const { mutateAsync: downloadPayroll, isPending: isDownloading } =
    useDownloadPayroll();

  const handleDownload = async (payroll) => {
    toast.info("Preparing your download...");
    try {
      const blob = await downloadPayroll(payroll.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Payslip_${payroll.employee.name}_${month}-${year}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download payslip.");
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const columns = [
    { key: "employee.code", header: "Emp. Code" },
    { key: "employee.name", header: "Name" },
    { key: "no_of_days_paid", header: "Paid Days" },
    {
      key: "net_payable_after_deduction",
      header: "Net Salary",
      render: formatCurrency,
    },
    {
      key: "status",
      header: "Status",
      render: (status) => <Badge className="capitalize">{status}</Badge>,
    },
    {
      key: "actions",
      header: "Payslip",
      width: "120px",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(row)}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-end gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(val) => setYear(Number(val))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>

        <GenericTable
          columns={columns}
          data={payrollData?.data?.payrolls || []}
          pagination={payrollData?.data}
          onPageChange={setCurrentPage}
          loading={isLoading}
          error={isError ? "Failed to load payroll data." : null}
          emptyMessage="No payroll records found for the selected period."
        />
      </div>

      <UploadPayrollDialog open={isUploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
