import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateEmployeeJobDetails } from "@/hooks/useEmployees";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { DatePickerComponent } from "@/components/ui/date-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const jobDetailsSchema = z.object({
  company_id: z.string().min(1, "Company is required"),
  department_id: z.string().min(1, "Department is required"),
  designation_id: z.string().min(1, "Designation is required"),
  employee_code: z.string().min(1, "Employee code is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().min(1, "Type is required"),
  joining_date: z.date({ message: "Joining date is required" }),
  confirmation_date: z.date().optional(),
  resignation_date: z.date().optional(),
  termination_date: z.date().optional(),
  last_working_date: z.date().optional(),
  reason_for_leaving: z.string().optional(),
  office_email: z.string().email("Invalid email format").min(1, "Office email is required"),
  office_phone_no: z.string().optional(),
  leave_policy_id: z.string().min(1, "Leave policy is required"),
  shift_id: z.string().min(1, "Shift is required"),
  reporting_to: z.string().optional(),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});

export const JobDetailsTab = ({ employee }) => {
  const { employment } = employee;

  const { mutate: updateJobDetails, isPending } = useUpdateEmployeeJobDetails();

  // Helper function to convert date strings to Date objects
  const parseDate = (dateValue) => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };

  // Get initial values from employee data
  const getInitialValues = () => ({
    employee_code: String(employment?.code || ""),
    company_id: String(employment?.company?.id || ""),
    department_id: String(employment?.department?.id || ""),
    designation_id: String(employment?.designation?.id || ""),
    status: employment?.status || "",
    type: employment?.type || "",
    joining_date: parseDate(employment?.joining_date),
    confirmation_date: parseDate(employment?.confirmation_date),
    resignation_date: parseDate(employment?.resignation_date),
    termination_date: parseDate(employment?.termination_date),
    last_working_date: parseDate(employment?.last_working_date),
    reason_for_leaving: employment?.reason_for_leaving || "",
    office_email: employee?.email || "",
    office_phone_no: employee?.phone_no || "",
    leave_policy_id: String(employment?.leave_policy?.id || ""),
    shift_id: String(employment?.shift?.id || ""),
    reporting_to: String(employment?.reporting_to?.id || ""),
    roles: employee?.roles?.map((r) => String(r)) || [],
  });

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: getInitialValues(),
  });

  // Reset form when employee data changes
  React.useEffect(() => {
    if (employee && employment) {
      const formData = getInitialValues();
      reset(formData);
    }
  }, [employee, employment, reset]);

  const selectedCompany = watch("company_id");
  const selectedDepartment = watch("department_id");
  const employmentStatus = watch("status");

  // Fetch master data for dropdowns
  const { data: companies } = useCompanies(1, 1000);
  const { data: departments } = useDepartments(1, 1000);
  const { data: designations } = useDesignations(1, 1000);
  const { data: leavePolicies } = useLeavePolicies(1, 1000);
  const { data: roles } = useRoles();
  const { data: shifts } = useShifts(1, 1000);
  const { data: managers } = useManagers(selectedCompany, selectedDepartment);

  const onSubmit = (data) => {
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const payload = {
      ...data,
      employee_code: Number(data.employee_code),
      company_id: Number(data.company_id),
      department_id: Number(data.department_id),
      designation_id: Number(data.designation_id),
      leave_policy_id: Number(data.leave_policy_id),
      shift_id: Number(data.shift_id),
      reporting_to: data.reporting_to ? Number(data.reporting_to) : null,
      roles: data.roles ? data.roles.map(Number) : [],
      joining_date: formatDate(data.joining_date),
      last_working_date: formatDate(data.last_working_date),
      // Ensure conditional dates are null if not provided
      confirmation_date:
        data.status === "confirmed" ? formatDate(data.confirmation_date) : null,
      resignation_date:
        data.status === "resigned" ? formatDate(data.resignation_date) : null,
      termination_date:
        data.status === "terminated" ? formatDate(data.termination_date) : null,
      reason_for_leaving: ["resigned", "terminated"].includes(data.status)
        ? data.reason_for_leaving
        : null,
    };
    updateJobDetails(
      { employeeId: employee.id, data: payload },
      {
        onSuccess: () => toast.success("Job details updated successfully!"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Update failed."),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Update the employee's role, department, and employment status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Company</Label>
              <Controller
                name="company_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Controller
                name="department_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Controller
                name="designation_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Employee Code</Label>
              <Input type="text" {...register("employee_code")} />
            </div>
            <div className="space-y-2">
              <Label>Employment Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Controller
                name="joining_date"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select joining date"
                    className="w-full"
                  />
                )}
              />
              {errors.joining_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.joining_date.message}
                </p>
              )}
            </div>
            {employmentStatus === "confirmed" && (
              <div className="space-y-2">
                <Label>Confirmation Date</Label>
                <Controller
                  name="confirmation_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerComponent
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select confirmation date"
                      className="w-full"
                    />
                  )}
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
                <Controller
                  name="resignation_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerComponent
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select resignation date"
                      className="w-full"
                    />
                  )}
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
                <Controller
                  name="termination_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerComponent
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select termination date"
                      className="w-full"
                    />
                  )}
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
                <Controller
                  name="last_working_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerComponent
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select last working date"
                      className="w-full"
                    />
                  )}
                />
                {errors.last_working_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.last_working_date.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Office Email</Label>
              <Input type="email" {...register("office_email")} />
            </div>
            <div className="space-y-2">
              <Label>Office Phone</Label>
              <Input type="text" {...register("office_phone_no")} />
            </div>
            <div className="space-y-2">
              <Label>Leave Policy</Label>
              <Controller
                name="leave_policy_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Controller
                name="shift_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
                      <SelectValue />
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
            {["resigned", "terminated"].includes(employmentStatus) && (
              <div className="space-y-2 lg:col-span-3">
                <Label>Reason for Leaving</Label>
                <Textarea {...register("reason_for_leaving")} />
              </div>
            )}
            <div className="space-y-2 lg:col-span-3">
              <Label>Roles</Label>
              <Controller
                name="roles"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={
                      roles?.data?.roles.map((r) => ({
                        value: r.name,
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
