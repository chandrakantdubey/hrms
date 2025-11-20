// src/components/employee/steps/ContactInfoStep.jsx

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useCreateEmployeeContactInfo } from "@/hooks/useEmployees";
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
import { indianStates } from "@/lib/constants";
import { isValidIndianPhoneNumber } from "@/lib/phoneValidation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const ContactInfoStep = ({ uuid, onSuccess, stepNumber, initialData = {} }) => {
  const { mutate: createContactInfo, isPending } =
    useCreateEmployeeContactInfo();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      address: initialData.address || "",
      city: initialData.city || "",
      state: initialData.state || "",
      // --- FIELD ADDED: Country is now included ---
      country: "India",
      postal_code: initialData.postal_code || "",
      emergency_contact: initialData.emergency_contact || [
        { name: "", type: "phone", value: "", relationship: "" },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "emergency_contact",
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: "India",
        postal_code: initialData.postal_code || "",
        emergency_contact: initialData.emergency_contact || [
          { name: "", type: "phone", value: "", relationship: "" },
        ],
      });
      // Replace the emergency contacts array
      if (initialData.emergency_contact && initialData.emergency_contact.length > 0) {
        replace(initialData.emergency_contact);
      }
    }
  }, [initialData, reset, replace]);

  const onSubmit = (data) => {
    // Validate emergency contacts - if name is provided, all fields must be filled
    const emergencyContacts = data.emergency_contact || [];
    for (let i = 0; i < emergencyContacts.length; i++) {
      const contact = emergencyContacts[i];
      if (contact.name && contact.name.trim()) {
        if (!contact.type) {
          toast.error(`Emergency contact ${i + 1}: Please select contact type`);
          return;
        }
        if (!contact.value || !contact.value.trim()) {
          toast.error(`Emergency contact ${i + 1}: Please provide contact value`);
          return;
        }
        if (!contact.relationship || !contact.relationship.trim()) {
          toast.error(`Emergency contact ${i + 1}: Please provide relationship`);
          return;
        }

        // Validate email format if type is email
        if (contact.type === "email" && contact.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(contact.value)) {
            toast.error(`Emergency contact ${i + 1}: Please enter a valid email address`);
            return;
          }
        }

        // Validate phone number if type is phone
        if (contact.type === "phone" && contact.value) {
          if (!isValidIndianPhoneNumber(contact.value)) {
            toast.error(`Emergency contact ${i + 1}: Please enter a valid Indian phone number`);
            return;
          }
        }
      }
    }

    // Filter out emergency contacts where the name is empty
    const cleanedData = {
      ...data,
      emergency_contact: data.emergency_contact.filter(
        (contact) => contact.name && contact.name.trim() !== ""
      ),
    };

    createContactInfo(
      { uuid, ...cleanedData },
      {
        onSuccess: () => {
          toast.success("Contact info saved successfully!");
          onSuccess(stepNumber, cleanedData);
        },
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to save contact info."
          ),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input
          id="address"
          {...register("address", { required: "Address is required." })}
          placeholder="e.g., 123 MG Road, Near Central Mall"
        />
        {errors.address && (
          <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register("city", { required: "City is required." })}
            placeholder="e.g., Bangalore"
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Controller
            name="state"
            control={control}
            rules={{ required: "State is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state..." />
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
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            {...register("postal_code", {
              required: "Postal code is required.",
              pattern: {
                value: /^\d{6}$/,
                message: "Postal code must be 6 digits."
              }
            })}
            placeholder="e.g., 560001"
          />
          {errors.postal_code && (
            <p className="text-sm text-red-500 mt-1">{errors.postal_code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register("country")}
            readOnly
            className="bg-muted/50 cursor-not-allowed"
            value="India"
          />
        </div>
      </div>

      <div>
        <Label>Emergency Contacts</Label>
        <div className="space-y-3 mt-2">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-10 gap-2 items-center p-4 border rounded-lg bg-muted/50"
            >
              <Input
                placeholder="Name"
                {...register(`emergency_contact.${index}.name`)}
                className="col-span-10 sm:col-span-3"
              />
              <Controller
                name={`emergency_contact.${index}.type`}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="col-span-10 sm:col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                placeholder="Contact Value (Phone or Email)"
                {...register(`emergency_contact.${index}.value`)}
                className="col-span-10 sm:col-span-3"
              />
              <Input
                placeholder="Relationship"
                {...register(`emergency_contact.${index}.relationship`)}
                className="col-span-10 sm:col-span-2"
              />
              <div className="col-span-10 sm:col-span-1 flex justify-end">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ name: "", type: "phone", value: "", relationship: "" })
            }
          >
            Add Another Contact
          </Button>
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
