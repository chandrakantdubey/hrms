import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateEmployeeContactInfo } from "@/hooks/useEmployees";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/constants";
import { toast } from "sonner";

export const ContactInfoTab = ({ employee }) => {
  const { mutate: updateContactInfo, isPending } =
    useUpdateEmployeeContactInfo();

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      address: employee?.profile?.address || "",
      city: employee?.profile?.city || "",
      state: employee?.profile?.state || "",
      country: employee?.profile?.country || "",
      postal_code: employee?.profile?.postal_code || "",
    },
  });

  // Reset form when employee data changes
  useEffect(() => {
    if (employee) {
      reset({
        address: employee.profile?.address || "",
        city: employee.profile?.city || "",
        state: employee.profile?.state || "",
        country: employee.profile?.country || "",
        postal_code: employee.profile?.postal_code || "",
      });
    }
  }, [employee, reset]);

  const onSubmit = (data) => {
    updateContactInfo(
      { employeeId: employee.id, data },
      {
        onSuccess: () => toast.success("Contact info updated successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Update failed."),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Update the employee's address information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" {...register("postal_code")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register("country")}
                readOnly
                className="bg-muted/50"
              />
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
