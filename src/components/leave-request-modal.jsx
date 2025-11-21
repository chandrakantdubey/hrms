import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerComponent } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateUserLeaveRequest,
  useDashboardOverview,
  useUpdateUserLeaveRequest,
} from "@/hooks/useUser";
import { useLeaveTypes } from "@/hooks/useMasters";

const leaveRequestFormSchema = z.object({
  leave_type_id: z.number({
    required_error: "Leave Type is required",
  }),
  start_date: z.date({ message: "Start Date is required." }),
  start_is_half_day: z.boolean().default(false),
  start_half: z.string().optional().nullable(),
  end_date: z.date({ message: "End Date is required." }),
  end_is_half_day: z.boolean().default(false),
  end_half: z.string().optional().nullable(),
  reason: z.string().min(1, { message: "Reason is required." }),
});

export const LeaveRequestModal = ({
  isOpen,
  onClose,
  leaveRequest,
  onSuccess,
}) => {
  const { data: leaveTypesData } = useLeaveTypes();

  const { data: dashboardStats } = useDashboardOverview();

  const leave_balance = dashboardStats?.data.leave_balance || 0;

  const { mutate: createLeaveRequest, isPending: isCreating } =
    useCreateUserLeaveRequest();
  const { mutate: updateLeaveRequest, isPending: isUpdating } =
    useUpdateUserLeaveRequest();

  const form = useForm({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      leave_type_id: leaveRequest?.leave_type_id || undefined,
      start_date: leaveRequest?.start_date ? new Date(leaveRequest.start_date) : undefined,
      start_is_half_day: leaveRequest?.start_is_half_day || false,
      start_half: leaveRequest?.start_half || null,
      end_date: leaveRequest?.end_date ? new Date(leaveRequest.end_date) : undefined,
      end_is_half_day: leaveRequest?.end_is_half_day || false,
      end_half: leaveRequest?.end_half || null,
      reason: leaveRequest?.reason || "",
    },
  });

  useEffect(() => {
    if (leaveRequest) {
      form.reset({
        leave_type_id: leaveRequest.leave_type_id,
        start_date: new Date(leaveRequest.start_date),
        start_is_half_day: leaveRequest.start_is_half_day,
        start_half: leaveRequest.start_half || null,
        end_date: new Date(leaveRequest.end_date),
        end_is_half_day: leaveRequest.end_is_half_day,
        end_half: leaveRequest.end_half || null,
        reason: leaveRequest.reason,
      });
    } else {
      form.reset({
        leave_type_id: undefined,
        start_date: undefined,
        start_is_half_day: false,
        start_half: null,
        end_date: undefined,
        end_is_half_day: false,
        end_half: null,
        reason: "",
      });
    }
  }, [leaveRequest, form, isOpen]);

  const handleSubmit = (values) => {
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const payload = {
      ...values,
      start_date: formatDate(values.start_date),
      end_date: formatDate(values.end_date),
      start_half: values.start_is_half_day ? values.start_half : null,
      end_half: values.end_is_half_day ? values.end_half : null,
    };

    if (leaveRequest) {
      updateLeaveRequest(
        { id: leaveRequest.id, ...payload },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        },
      );
    } else {
      createLeaveRequest(payload, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const selectedLeaveTypeId = form.watch("leave_type_id");
  const selectedLeaveType = leaveTypesData?.data?.leave_types.find(
    (lt) => lt.id === selectedLeaveTypeId,
  );

  const isUnpaidLeave =
    selectedLeaveType?.name.toLowerCase().includes("unpaid") ||
    leave_balance <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle>
            {leaveRequest ? "Edit Leave Request" : "Create Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {leaveRequest
              ? "Edit the leave request details."
              : "Create a new leave request here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="leave_type_id">Leave Type</Label>
            <Select
              onValueChange={(value) => {
                const numValue = value ? parseInt(value, 10) : undefined;
                form.setValue("leave_type_id", numValue);
              }}
              value={
                form.watch("leave_type_id")
                  ? String(form.watch("leave_type_id"))
                  : ""
              }
              key={`leave_type_${leaveRequest?.id || "new"}`}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypesData?.data?.leave_types.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.leave_type_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.leave_type_id.message}
              </p>
            )}
          </div>
          {isUnpaidLeave && (
            <div className="text-center text-sm text-orange-500">
              This will be considered as unpaid leave.
            </div>
          )}
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="start_date">Start Date</Label>
            <Controller
              name="start_date"
              control={form.control}
              render={({ field }) => (
                <DatePickerComponent
                  id="start_date"
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                />
              )}
            />
            {form.formState.errors.start_date && (
              <p className=" col-start-2 text-left text-sm text-red-500">
                {form.formState.errors.start_date.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="start_is_half_day">Start Half Day</Label>
            <div className=" flex items-center">
              <Checkbox
                id="start_is_half_day"
                checked={form.watch("start_is_half_day")}
                onCheckedChange={(checked) =>
                  form.setValue("start_is_half_day", !!checked)
                }
              />
            </div>
          </div>
          {form.watch("start_is_half_day") && (
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="start_half">Start Half</Label>
              <Select
                onValueChange={(value) => form.setValue("start_half", value)}
                value={form.watch("start_half") || ""}
                key={`start_half_${leaveRequest?.id || "new"}`}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select half" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Half</SelectItem>
                  <SelectItem value="second">Second Half</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="end_date">End Date</Label>
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <DatePickerComponent
                  id="end_date"
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                />
              )}
            />
            {form.formState.errors.end_date && (
              <p className=" col-start-2 text-left text-sm text-red-500">
                {form.formState.errors.end_date.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="end_is_half_day">End Half Day</Label>
            <div className=" flex items-center">
              <Checkbox
                id="end_is_half_day"
                checked={form.watch("end_is_half_day")}
                onCheckedChange={(checked) =>
                  form.setValue("end_is_half_day", !!checked)
                }
              />
            </div>
          </div>
          {form.watch("end_is_half_day") && (
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="end_half">End Half</Label>
              <Select
                onValueChange={(value) => form.setValue("end_half", value)}
                value={form.watch("end_half") || ""}
                key={`end_half_${leaveRequest?.id || "new"}`}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select half" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Half</SelectItem>
                  <SelectItem value="second">Second Half</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" {...form.register("reason")} className="" />
            {form.formState.errors.reason && (
              <p className=" col-start-2 text-left text-sm text-red-500">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Apply Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
