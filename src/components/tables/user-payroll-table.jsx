import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUserPayrolls, useUserPayrollById } from "@/hooks/useUser";
import { Download } from "lucide-react";
import { GenericTable } from "../ui/generic-table";

function UserPayrollTable() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Use the updated hooks
  const { data, isLoading, isError } = useUserPayrolls({
    page: currentPage,
    limit: 10,
  });

  const { mutateAsync: downloadPayroll, isPending: isDownloading } =
    useUserPayrollById();

  // Handler for downloading the PDF
  const handleDownloadPdf = async (payrollId, month, year) => {
    toast.info("Preparing your download...");
    try {
      const blobResponse = await downloadPayroll(payrollId);

      const url = window.URL.createObjectURL(blobResponse);
      const link = document.createElement("a");
      link.href = url;
      // Use month and year for a more descriptive filename
      link.setAttribute("download", `Payroll_Slip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Payroll PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to download payroll PDF:", error);
      toast.error("Failed to download payroll PDF.");
    }
  };

  // Define columns for the GenericTable
  const columns = [
    {
      key: "month",
      header: "Month",
    },
    {
      key: "year",
      header: "Year",
    },
    {
      key: "amount",
      header: "Net Salary",
      // Optional: Render with currency formatting
      render: (amount) => {
        if (typeof amount !== "number") return amount;
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount);
      },
    },
    {
      key: "actions",

      width: "120px",

      headerClassName: "text-right",

      cellClassName: "text-right",
      header: "Download",
      render: (_, row) => {
        // The first arg is cell value, which we don't need
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownloadPdf(row.id, row.month, row.year)}
            disabled={isDownloading} // Disable button while a download is in progress
            aria-label="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  // While GenericTable has a loader, a top-level loader for the initial fetch is good UX
  if (isLoading && !data) {
    return <div className="p-4">Loading payroll records...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading payroll records. Please try again.
      </div>
    );
  }

  // Prepare data and pagination object for GenericTable from the API response
  const payrollRecords = data?.data?.payrolls || [];
  const paginationInfo = data?.data?.pagination || {
    current_page: currentPage,
    last_page: 1,
    total_record: payrollRecords.length,
  };

  return (
    <GenericTable
      columns={columns}
      data={payrollRecords}
      pagination={paginationInfo}
      onPageChange={setCurrentPage} // This state change triggers the hook to refetch
      loading={isLoading} // Show the table's inline loader on page changes
      emptyMessage="No payroll records found."
    />
  );
}

export { UserPayrollTable };
