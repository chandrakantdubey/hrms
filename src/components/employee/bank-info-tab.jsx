import React from "react";
import { useForm } from "react-hook-form";
import { useUpdateEmployeeBankInfo } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const BankInfoTab = ({ employee }) => {
  const { employment } = employee;
  const { mutate: updateBankInfo, isPending } = useUpdateEmployeeBankInfo();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      aadhaar_no: employment.aadhaar_no,
      pan_no: employment.pan_no,
      uan_no: employment.uan_no,
      bank_account_no: employment.bank_account_no,
      ifsc_code: employment.ifsc_code,
      bank_name: employment.bank_name,
    },
  });

  const onSubmit = (data) => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value)
    );
    updateBankInfo(
      { employeeId: employee.id, data: payload },
      {
        onSuccess: () => toast.success("Bank info updated successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Update failed."),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial & ID Information</CardTitle>
        <CardDescription>
          Update the employee's bank and government ID details.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              />
              {errors.pan_no && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.pan_no.message}
                </p>
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
              />
              {errors.uan_no && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.uan_no.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bank_account_no">Bank Account No.</Label>
              <Input id="bank_account_no" {...register("bank_account_no")} />
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
              <Input id="bank_name" {...register("bank_name")} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
