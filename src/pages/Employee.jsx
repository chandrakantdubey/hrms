import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { useEmployeeById } from "@/hooks/useEmployees";
import { useParams, Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

// You will create these tab content components next
import { PersonalInfoTab } from "@/components/employee/personal-info-tab";
import { JobDetailsTab } from "@/components/employee/job-details-tab";
import { ContactInfoTab } from "@/components/employee/contact-info-tab";
import { BankInfoTab } from "@/components/employee/bank-info-tab";
import { DocumentsTab } from "@/components/employee/documents-tab";

const EmployeeHeader = ({ employee }) => {
  const profile = employee?.profile;
  const employment = employee?.employment;
  const fullName = `${profile?.first_name || ""} ${
    profile?.last_name || ""
  }`.trim();

  return (
    <Card>
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile?.profile_image_url} alt={fullName} />
          <AvatarFallback>
            {profile?.first_name?.[0]}
            {profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-muted-foreground">{employee?.email}</p>
          <p className="text-muted-foreground">
            {employment?.designation?.name || "N/A"} at{" "}
            {employment?.department?.name || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Employee() {
  const { id } = useParams();
  const { data: employeeData, isLoading, isError } = useEmployeeById(id);
  const employee = employeeData?.data;

  // Set page title dynamically once data is loaded
  useSetPageTitle(
    employee
      ? `${employee.profile?.first_name} ${employee.profile?.last_name}`
      : "Employee Profile"
  );

  if (isLoading) {
    return <div className="p-6">Loading employee profile...</div>;
  }

  if (isError || !employee) {
    return (
      <div className="p-6 text-destructive">Error loading employee data.</div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link
        to="/employees"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger className="cursor-pointer" value="personal">
            Personal
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="job">
            Job
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="contact">
            Contact
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="bank">
            Bank
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="documents">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <PersonalInfoTab employee={employee} />
        </TabsContent>
        <TabsContent value="job" className="mt-4">
          <JobDetailsTab employee={employee} />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <ContactInfoTab employee={employee} />
        </TabsContent>
        <TabsContent value="bank" className="mt-4">
          <BankInfoTab employee={employee} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
