// src/components/employee/steps/JobDetailsStep.jsx

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useCreateEmployeeJobDetails } from "@/hooks/useEmployees";
import {
  useCompanies,
  useDepartments,
  useDesignations,
  useLeavePolicies,
  useRoles,
  useShifts,
  useManagers,
} from "@/hooks/useMasters";
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
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";

export const JobDetailsStep = ({ uuid, onSuccess, onBack, stepNumber, initialData = {} }) => {
  const { mutate: createJobDetails, isPending } = useCreateEmployeeJobDetails();
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      company_id: initialData.company_id || "",
      department_id: initialData.department_id || "",
      designation_id: initialData.designation_id || "",
      employee_code: initialData.employee_code || "",
      status: initialData.status || "",
      type: initialData.type || "",
      joining_date: initialData.joining_date || "",
      confirmation_date: initialData.confirmation_date || "",
      resignation_date: initialData.resignation_date || "",
      termination_date: initialData.termination_date || "",
      last_working_date: initialData.last_working_date || "",
      reason_for_leaving: initialData.reason_for_leaving || "",
      office_email: initialData.office_email || "",
      office_phone_no: initialData.office_phone_no || "",
      leave_policy_id: initialData.leave_policy_id || "",
      shift_id: initialData.shift_id || "",
      reporting_to: initialData.reporting_to || "",
      roles: initialData.roles || [],
    }
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        company_id: initialData.company_id || "",
        department_id: initialData.department_id || "",
        designation_id: initialData.designation_id || "",
        employee_code: initialData.employee_code || "",
        status: initialData.status || "",
        type: initialData.type || "",
        joining_date: initialData.joining_date || "",
        confirmation_date: initialData.confirmation_date || "",
        resignation_date: initialData.resignation_date || "",
        termination_date: initialData.termination_date || "",
        last_working_date: initialData.last_working_date || "",
        reason_for_leaving: initialData.reason_for_leaving || "",
        office_email: initialData.office_email || "",
        office_phone_no: initialData.office_phone_no || "",
        leave_policy_id: initialData.leave_policy_id || "",
        shift_id: initialData.shift_id || "",
        reporting_to: initialData.reporting_to || "",
        roles: initialData.roles || [],
      });
    }
  }, [initialData, reset]);

  // Watch the status field for conditional rendering - must be after useForm
  const employmentStatus = watch("status");

  const selectedCompany = watch("company_id");
  const selectedDepartment = watch("department_id");

  // Fetch master data for dropdowns
  const { data: companies } = useCompanies(1, 1000);
  const { data: departments } = useDepartments(1, 1000);
  const { data: designations } = useDesignations(1, 1000);
  const { data: leavePolicies } = useLeavePolicies(1, 1000);
  const { data: roles } = useRoles();
  const { data: shifts } = useShifts(1, 1000);
  const { data: managers } = useManagers(selectedCompany, selectedDepartment);

  const onSubmit = (data) => {
    // Date validation logic
    const joining = new Date(data.joining_date);
    const today = new Date();

    // Validate confirmation date if status is confirmed
    if (data.status === "confirmed" && data.confirmation_date) {
      const confirmation = new Date(data.confirmation_date);
      if (confirmation <= joining) {
        toast.error("Confirmation date must be after joining date");
        return;
      }
      if (confirmation > today) {
        toast.error("Confirmation date cannot be in the future");
        return;
      }
    }

    // Validate resignation date if status is resigned
    if (data.status === "resigned" && data.resignation_date) {
      const resignation = new Date(data.resignation_date);
      if (resignation <= joining) {
        toast.error("Resignation date must be after joining date");
        return;
      }
      if (resignation > today) {
        toast.error("Resignation date cannot be in the future");
        return;
      }
    }

    // Validate termination date if status is terminated
    if (data.status === "terminated" && data.termination_date) {
      const termination = new Date(data.termination_date);
      if (termination <= joining) {
        toast.error("Termination date must be after joining date");
        return;
      }
      if (termination > today) {
        toast.error("Termination date cannot be in the future");
        return;
      }
    }

    // Validate last working date for resigned/terminated employees
    if ((data.status === "resigned" || data.status === "terminated") && data.last_working_date) {
      const lastWorking = new Date(data.last_working_date);
      const relevantDate = data.status === "resigned" ? new Date(data.resignation_date) : new Date(data.termination_date);

      if (lastWorking <= relevantDate) {
        toast.error("Last working date must be after resignation/termination date");
        return;
      }
      if (lastWorking > today) {
        toast.error("Last working date cannot be in the future");
        return;
      }
    }

    // Clean up the payload to send null for empty optional fields
    const payload = {
      ...data,
      uuid,
      company_id: Number(data.company_id),
      department_id: Number(data.department_id),
      designation_id: Number(data.designation_id),
      leave_policy_id: Number(data.leave_policy_id),
      shift_id: Number(data.shift_id),
      reporting_to: data.reporting_to ? Number(data.reporting_to) : null,
      roles: data.roles ? data.roles.map(Number) : [],
      // Ensure conditional dates are null if not provided
      confirmation_date:
        data.status === "confirmed" ? data.confirmation_date : null,
      resignation_date:
        data.status === "resigned" ? data.resignation_date : null,
      termination_date:
        data.status === "terminated" ? data.termination_date : null,
      reason_for_leaving: ["resigned", "terminated"].includes(data.status)
        ? data.reason_for_leaving
        : null,
      last_working_date: data.last_working_date || null,
    };

    createJobDetails(payload, {
      onSuccess: () => {
        toast.success("Job details saved!");
        onSuccess(stepNumber, data);
      },
      onError: (err) =>
        toast.error(
          err.response?.data?.message || "Failed to save job details."
        ),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Company</Label>
          <Controller
            name="company_id"
            control={control}
            rules={{ required: "Company is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {companies?.data?.companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.company_id && (
            <p className="text-sm text-red-500 mt-1">
              {errors.company_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Controller
            name="department_id"
            control={control}
            rules={{ required: "Department is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {departments?.data?.departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.department_id && (
            <p className="text-sm text-red-500 mt-1">
              {errors.department_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Designation</Label>
          <Controller
            name="designation_id"
            control={control}
            rules={{ required: "Designation is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {designations?.data?.designations.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.designation_id && (
            <p className="text-sm text-red-500 mt-1">
              {errors.designation_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Employee Code</Label>
          <Input
            type="text"
            {...register("employee_code", {
              required: "Employee code is required.",
            })}
          />
          {errors.employee_code && (
            <p className="text-sm text-red-500 mt-1">
              {errors.employee_code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Employment Status</Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-sm text-red-500 mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-sm text-red-500 mt-1">
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Joining Date</Label>
          <Input
            type="date"
            {...register("joining_date", {
              required: "Joining date is required.",
            })}
          />
          {errors.joining_date && (
            <p className="text-sm text-red-500 mt-1">
              {errors.joining_date.message}
            </p>
          )}
        </div>

        {/* --- CONDITIONAL FIELDS START HERE --- */}
        {employmentStatus === "confirmed" && (
          <div className="space-y-2">
            <Label>Confirmation Date</Label>
            <Input
              type="date"
              {...register("confirmation_date", {
                required:
                  "Confirmation date is required for 'Confirmed' status.",
              })}
            />
            {errors.confirmation_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmation_date.message}
              </p>
            )}
          </div>
        )}
        {employmentStatus === "resigned" && (
          <div className="space-y-2">
            <Label>Resignation Date</Label>
            <Input
              type="date"
              {...register("resignation_date", {
                required: "Resignation date is required for 'Resigned' status.",
              })}
            />
            {errors.resignation_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.resignation_date.message}
              </p>
            )}
          </div>
        )}
        {employmentStatus === "terminated" && (
          <div className="space-y-2">
            <Label>Termination Date</Label>
            <Input
              type="date"
              {...register("termination_date", {
                required:
                  "Termination date is required for 'Terminated' status.",
              })}
            />
            {errors.termination_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.termination_date.message}
              </p>
            )}
          </div>
        )}
        {["resigned", "terminated"].includes(employmentStatus) && (
          <div className="space-y-2">
            <Label>Last Working Date</Label>
            <Input type="date" {...register("last_working_date")} />
            {errors.last_working_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.last_working_date.message}
              </p>
            )}
          </div>
        )}

        {["resigned", "terminated"].includes(employmentStatus) && (
          <div className="space-y-2">
            <Label>Reason for Leaving</Label>
            <Textarea
              {...register("reason_for_leaving", {
                required: "Reason for leaving is required for resigned/terminated employees."
              })}
              placeholder="Please provide reason for leaving..."
            />
            {errors.reason_for_leaving && (
              <p className="text-sm text-red-500 mt-1">
                {errors.reason_for_leaving.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Office Email</Label>
          <Input
            type="email"
            {...register("office_email", {
              required: "Office email is required.",
            })}
          />
          {errors.office_email && (
            <p className="text-sm text-red-500 mt-1">
              {errors.office_email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Office Phone (Optional)</Label>
          <Input type="text" {...register("office_phone_no")} />
          {errors.office_phone_no && (
            <p className="text-sm text-red-500 mt-1">
              {errors.office_phone_no.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Leave Policy</Label>
          <Controller
            name="leave_policy_id"
            control={control}
            rules={{ required: "Leave policy is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {leavePolicies?.data?.leave_policies.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.leave_policy_id && (
            <p className="text-sm text-red-500 mt-1">
              {errors.leave_policy_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Shift</Label>
          <Controller
            name="shift_id"
            control={control}
            rules={{ required: "Shift is required." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts?.data?.shifts.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.shift_id && (
            <p className="text-sm text-red-500 mt-1">
              {errors.shift_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Reporting To</Label>
          <Controller
            name="reporting_to"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!managers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedCompany || !selectedDepartment
                        ? "Select company & dept first"
                        : "Select manager..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {managers?.data?.employees.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.username || m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label>Roles</Label>
          <Controller
            name="roles"
            control={control}
            rules={{ required: "At least one role is required." }}
            render={({ field }) => (
              <MultiSelect
                options={
                  roles?.data?.roles.map((r) => ({
                    value: String(r.id),
                    label: r.name,
                  })) || []
                }
                selected={field.value}
                onChange={field.onChange}
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
