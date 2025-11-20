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
import { useImportEmployees } from "@/hooks/useEmployees";

export const UploadEmployeesDialog = ({ open, onOpenChange }) => {
  const { mutate: importFile, isPending: isUploading } = useImportEmployees();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const selectedFile = watch("file");

  const onSubmit = (formData) => {
    importFile(
      { file: formData.file[0] },
      {
        onSuccess: () => {
          toast.success(
            "Employees file uploaded successfully! Processing will begin."
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
          <DialogTitle>Import Employees</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import employees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="file">Employees File</Label>
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
              {isUploading ? "Uploading..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
