import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadPayrollFile } from "@/hooks/useEmployees";

// Helper to generate months for the dropdown
const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
}));

export const UploadPayrollDialog = ({ open, onOpenChange }) => {
  const { mutate: uploadFile, isPending: isUploading } = useUploadPayrollFile();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const selectedFile = watch("file");

  const onSubmit = (formData) => {
    uploadFile(
      { ...formData, file: formData.file[0] },
      {
        onSuccess: () => {
          toast.success(
            "Payroll file uploaded successfully! Processing will begin."
          );
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "File upload failed.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payroll Data</DialogTitle>
          <DialogDescription>
            Select a month, year, and upload the corresponding Excel file.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <Select
                onValueChange={(value) =>
                  setValue("month", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && (
                <p className="text-sm text-red-500 mt-1">Month is required.</p>
              )}
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder={new Date().getFullYear()}
                {...register("year", { required: "Year is required." })}
              />
              {errors.year && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="file">Payroll File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              {...register("file", { required: "File is required." })}
            />
            {errors.file && (
              <p className="text-sm text-red-500 mt-1">{errors.file.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
