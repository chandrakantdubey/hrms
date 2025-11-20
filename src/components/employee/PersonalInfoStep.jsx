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
import { isValidIndianPhoneNumber } from "@/lib/phoneValidation";
import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";

export const PersonalInfoStep = ({ onSuccess, onError, initialData = {} }) => {
  const { mutate: createPersonalInfo, isPending } =
    useCreateEmployeePersonalInfo();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: initialData.first_name || "",
      middle_name: initialData.middle_name || "",
      last_name: initialData.last_name || "",
      date_of_birth: initialData.date_of_birth || "",
      gender: initialData.gender || "",
      marital_status: initialData.marital_status || "",
      blood_group: initialData.blood_group || "",
      personal_email: initialData.personal_email || "",
      personal_phone_no: initialData.personal_phone_no || "",
    }
  });

  // Calculate minimum date for date of birth (18 years ago)
  const minDateOfBirth = new Date();
  minDateOfBirth.setFullYear(minDateOfBirth.getFullYear() - 18);

  const onSubmit = (data) => {
    // Validate date of birth
    const dob = new Date(data.date_of_birth);
    const today = new Date();

    if (dob > today) {
      toast.error("Date of birth cannot be in the future");
      return;
    }

    if (dob > minDateOfBirth) {
      toast.error("Employee must be at least 18 years old");
      return;
    }

    createPersonalInfo(data, {
      onSuccess: (response) => {
        toast.success("Personal info saved successfully!");
        onSuccess(response.data.uuid, data);
      },
      onError: (err) => {
        const errorMessage = err.response?.data?.message || "Failed to save personal info.";
        toast.error(errorMessage);
        if (onError) onError(errorMessage);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register("first_name", {
              required: "First name is required",
              minLength: { value: 2, message: "First name must be at least 2 characters" },
              maxLength: { value: 50, message: "First name must be less than 50 characters" },
              pattern: { value: /^[A-Za-z\s]+$/, message: "First name can only contain letters and spaces" }
            })}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name (Optional)</Label>
          <Input
            id="middle_name"
            {...register("middle_name", {
              maxLength: { value: 50, message: "Middle name must be less than 50 characters" },
              pattern: { value: /^[A-Za-z\s]*$/, message: "Middle name can only contain letters and spaces" }
            })}
          />
          {errors.middle_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.middle_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register("last_name", {
              required: "Last name is required",
              minLength: { value: 2, message: "Last name must be at least 2 characters" },
              maxLength: { value: 50, message: "Last name must be less than 50 characters" },
              pattern: { value: /^[A-Za-z\s]+$/, message: "Last name can only contain letters and spaces" }
            })}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth", {
              required: "Date of birth is required",
              validate: (value) => {
                const dob = new Date(value);
                const today = new Date();
                const minDate = new Date();
                minDate.setFullYear(minDate.getFullYear() - 18);

                if (dob > today) return "Date of birth cannot be in the future";
                if (dob > minDate) return "Employee must be at least 18 years old";
                return true;
              }
            })}
            max={minDateOfBirth.toISOString().split('T')[0]}
          />
          {errors.date_of_birth && (
            <p className="text-sm text-red-500 mt-1">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Gender is required" }}
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
          {errors.gender && (
            <p className="text-sm text-red-500 mt-1">
              {errors.gender.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Controller
            name="marital_status"
            control={control}
            rules={{ required: "Marital status is required" }}
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
          {errors.marital_status && (
            <p className="text-sm text-red-500 mt-1">
              {errors.marital_status.message}
            </p>
          )}
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
            {...register("personal_email", {
              required: "Personal email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address"
              }
            })}
          />
          {errors.personal_email && (
            <p className="text-sm text-red-500 mt-1">
              {errors.personal_email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Personal Phone</Label>
          <Controller
            name="personal_phone_no"
            control={control}
            rules={{
              required: "Personal phone number is required",
              validate: (value) => {
                if (!value) return "Personal phone number is required";
                if (!isValidIndianPhoneNumber(value)) {
                  return "Please enter a valid Indian phone number";
                }
                return true;
              }
            }}
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
          {errors.personal_phone_no && (
            <p className="text-sm text-red-500 mt-1">
              {errors.personal_phone_no.message}
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
