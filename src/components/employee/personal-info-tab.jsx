import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateEmployeePersonalInfo } from "@/hooks/useEmployees";
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
import { bloodGroups } from "@/lib/constants";
import PhoneInput from "react-phone-input-2";
import { toast } from "sonner";

export const PersonalInfoTab = ({ employee }) => {
  const { mutate: updatePersonalInfo, isPending } =
    useUpdateEmployeePersonalInfo();

  // Destructure 'control' and 'reset' for controlled components and form updates
  const { register, handleSubmit, control, reset } = useForm();

  // This useEffect ensures the form is repopulated if the user navigates
  // between different employee pages without a full page reload.
  useEffect(() => {
    if (employee) {
      reset({
        first_name: employee.profile.first_name,
        middle_name: employee.profile.middle_name || "",
        last_name: employee.profile.last_name,
        date_of_birth: employee.profile.date_of_birth
          ? new Date(employee.profile.date_of_birth).toISOString().split("T")[0]
          : "",
        gender: employee.profile.gender,
        marital_status: employee.profile.marital_status,
        blood_group: employee.profile.blood_group,
        personal_email: employee.email,
        personal_phone_no: employee.phone_no,
      });
    }
  }, [employee, reset]);

  const onSubmit = (data) => {
    // The payload for the update API call
    const payload = {
      ...data,
      // The API might expect `email` and `phone_no` at the top level,
      // so we ensure they are mapped correctly if the form names are different.
      email: data.personal_email,
      phone_no: data.personal_phone_no,
    };

    updatePersonalInfo(
      { employeeId: employee.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Personal info updated successfully!");
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Failed to update personal info."
          );
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          View and update the employee's personal details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register("first_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name (Optional)</Label>
              <Input id="middle_name" {...register("middle_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register("last_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                      <SelectItem value="o">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Controller
                name="marital_status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Controller
                name="blood_group"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg.toLowerCase()}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal_email">Personal Email</Label>
              <Input
                id="personal_email"
                type="email"
                {...register("personal_email")}
              />
            </div>
            <div className="space-y-2">
              <Label>Personal Phone</Label>
              <Controller
                name="personal_phone_no"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={"in"}
                    value={field.value}
                    onChange={field.onChange}
                    inputClass="
                  w-full
                  px-4 py-2
                  rounded-[var(--radius)]
                  bg-input/30 text-foreground
                  border border-border
                  placeholder-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring
                  transition-colors duration-200
                "
                    buttonClass="
                  !bg-background !text-foreground
                  !border-r !border-border
                  hover:!bg-muted
                  dark:!bg-background dark:!text-foreground
                "
                    dropdownClass="
                  !bg-popover !text-popover-foreground
                  !border !border-border
                  dark:!bg-popover dark:!text-popover-foreground
                "
                  />
                )}
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
