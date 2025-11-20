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

export const JobDetailsTab = ({ employee }) => {
  const { employment } = employee;

  const { mutate: updateJobDetails, isPending } = useUpdateEmployeeJobDetails();

  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      employee_code: employment.code,
      company_id: String(employment.company?.id),
      department_id: String(employment.department?.id),
      designation_id: String(employment.designation?.id),
      status: employment.status,
      type: employment.type,
      joining_date: employment.joining_date
        ? new Date(employment.joining_date).toISOString().split("T")[0]
        : "",
      confirmation_date: employment.confirmation_date
        ? new Date(employment.confirmation_date).toISOString().split("T")[0]
        : "",
      resignation_date: employment.resignation_date
        ? new Date(employment.resignation_date).toISOString().split("T")[0]
        : "",
      termination_date: employment.termination_date
        ? new Date(employment.termination_date).toISOString().split("T")[0]
        : "",
      last_working_date: employment.last_working_date
        ? new Date(employment.last_working_date).toISOString().split("T")[0]
        : "",
      reason_for_leaving: employment.reason_for_leaving,
      office_email: employee.email,
      office_phone_no: employee.phone_no,
      leave_policy_id: String(employment.leave_policy?.id),
      shift_id: String(employment.shift?.id),
      reporting_to: String(employment.reporting_to?.id),
      roles: employee.roles?.filter(Boolean).map((r) => String(r.id)) || [],
    },
  });

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
    const payload = {
      ...data,
      company_id: Number(data.company_id),
      department_id: Number(data.department_id),
      designation_id: Number(data.designation_id),
      leave_policy_id: Number(data.leave_policy_id),
      shift_id: Number(data.shift_id),
      reporting_to: data.reporting_to ? Number(data.reporting_to) : null,
      roles: data.roles ? data.roles.map(Number) : [],
      confirmation_date:
        data.status === "confirmed" ? data.confirmation_date : null,
      resignation_date:
        data.status === "resigned" ? data.resignation_date : null,
      termination_date:
        data.status === "terminated" ? data.termination_date : null,
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
              <Input type="date" {...register("joining_date")} />
            </div>
            {employmentStatus === "confirmed" && (
              <div className="space-y-2">
                <Label>Confirmation Date</Label>
                <Input type="date" {...register("confirmation_date")} />
              </div>
            )}
            {employmentStatus === "resigned" && (
              <div className="space-y-2">
                <Label>Resignation Date</Label>
                <Input type="date" {...register("resignation_date")} />
              </div>
            )}
            {employmentStatus === "terminated" && (
              <div className="space-y-2">
                <Label>Termination Date</Label>
                <Input type="date" {...register("termination_date")} />
              </div>
            )}
            {["resigned", "terminated"].includes(employmentStatus) && (
              <div className="space-y-2">
                <Label>Last Working Date</Label>
                <Input type="date" {...register("last_working_date")} />
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
