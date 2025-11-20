import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useCreateEmployeePersonalInfo } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
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
// import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";

export const PersonalInfoStep = ({ onSuccess }) => {
  const { mutate: createPersonalInfo, isPending } =
    useCreateEmployeePersonalInfo();
  const { register, handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    createPersonalInfo(data, {
      onSuccess: (response) => {
        toast.success("Personal info saved successfully!");
        onSuccess(response.data.uuid);
      },
      onError: (err) =>
        toast.error(
          err.response?.data?.message || "Failed to save personal info."
        ),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register("first_name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name (Optional)</Label>
          <Input id="middle_name" {...register("middle_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register("last_name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: true }}
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
            rules={{ required: true }}
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
            {...register("personal_email", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Personal Phone</Label>
          <Controller
            name="personal_phone_no"
            control={control}
            disableDropdown
            rules={{ required: true }}
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
      <div className="flex justify-end pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save & Next"}
        </Button>
      </div>
    </form>
  );
};
