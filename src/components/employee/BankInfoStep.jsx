import React from "react";
import { useForm } from "react-hook-form";
import { useCreateEmployeeBankInfo } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const BankInfoStep = ({ uuid, onSuccess, stepNumber, initialData = {} }) => {
  const { mutate: createBankInfo, isPending } = useCreateEmployeeBankInfo();
  // Destructure 'errors' from formState to display validation messages
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      aadhaar_no: initialData.aadhaar_no || "",
      pan_no: initialData.pan_no || "",
      uan_no: initialData.uan_no || "",
      bank_account_no: initialData.bank_account_no || "",
      ifsc_code: initialData.ifsc_code || "",
      bank_name: initialData.bank_name || "",
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        aadhaar_no: initialData.aadhaar_no || "",
        pan_no: initialData.pan_no || "",
        uan_no: initialData.uan_no || "",
        bank_account_no: initialData.bank_account_no || "",
        ifsc_code: initialData.ifsc_code || "",
        bank_name: initialData.bank_name || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    // Filter out empty string fields before submitting, as all are nullable
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value && value.trim() !== "")
    );

    createBankInfo(
      { uuid, ...payload },
      {
        onSuccess: () => {
          toast.success("Bank info saved successfully!");
          onSuccess(stepNumber, data);
        },
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to save bank info."
          ),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="aadhaar_no">Aadhaar Number</Label>
          <Input
            id="aadhaar_no"
            {...register("aadhaar_no", {
              pattern: {
                value: /^\d{12}$/,
                message: "Aadhaar must be 12 digits.",
              },
            })}
            placeholder="XXXX XXXX XXXX"
          />
          {errors.aadhaar_no && (
            <p className="text-sm text-red-500 mt-1">
              {errors.aadhaar_no.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pan_no">PAN Number</Label>
          <Input
            id="pan_no"
            {...register("pan_no", {
              pattern: {
                value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Invalid PAN format.",
              },
            })}
            placeholder="ABCDE1234F"
          />
          {errors.pan_no && (
            <p className="text-sm text-red-500 mt-1">{errors.pan_no.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="uan_no">UAN Number</Label>
          <Input
            id="uan_no"
            {...register("uan_no", {
              pattern: {
                value: /^\d{12}$/,
                message: "UAN must be 12 digits.",
              },
            })}
            placeholder="Optional"
          />
          {errors.uan_no && (
            <p className="text-sm text-red-500 mt-1">{errors.uan_no.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bank_account_no">Bank Account No.</Label>
          <Input
            id="bank_account_no"
            {...register("bank_account_no", {
              maxLength: { value: 20, message: "Max 20 characters." },
            })}
          />
          {errors.bank_account_no && (
            <p className="text-sm text-red-500 mt-1">
              {errors.bank_account_no.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ifsc_code">IFSC Code</Label>
          <Input
            id="ifsc_code"
            {...register("ifsc_code", {
              pattern: {
                value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                message: "Invalid IFSC format.",
              },
            })}
          />
          {errors.ifsc_code && (
            <p className="text-sm text-red-500 mt-1">
              {errors.ifsc_code.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input
            id="bank_name"
            {...register("bank_name", {
              maxLength: { value: 255, message: "Max 255 characters." },
            })}
          />
          {errors.bank_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.bank_name.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save & Next"}
        </Button>
      </div>
    </form>
  );
};
