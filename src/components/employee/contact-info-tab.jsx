import React, { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Trash2 } from "lucide-react";

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
      emergency_contact: employee?.profile?.emergency_contact || [
        { name: "", type: "phone", value: "", relationship: "" },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "emergency_contact",
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
        emergency_contact: employee.profile?.emergency_contact || [
          { name: "", type: "phone", value: "", relationship: "" },
        ],
      });
      // Replace the emergency contacts array
      if (employee.profile?.emergency_contact && employee.profile.emergency_contact.length > 0) {
        replace(employee.profile.emergency_contact);
      }
    }
  }, [employee, reset, replace]);

  const onSubmit = (data) => {
    // Filter out emergency contacts where the name is empty
    const cleanedData = {
      ...data,
      emergency_contact: data.emergency_contact.filter(
        (contact) => contact.name && contact.name.trim() !== ""
      ),
    };

    updateContactInfo(
      { employeeId: employee.id, data: cleanedData },
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
