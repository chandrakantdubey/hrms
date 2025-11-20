// src/pages/Masters.jsx

import React from "react";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RolesMaster } from "@/components/roles-master";
import { PermissionsMaster } from "@/components/permissions-master";
import { CompaniesMaster } from "@/components/companies-master";
import { DepartmentsMaster } from "@/components/departments-master";
import { DesignationsMaster } from "@/components/designations-master";
import { LeaveTypesMaster } from "@/components/leave-types-master";
import { HolidaysMaster } from "@/components/holidays-master";
import { DocumentTypesMaster } from "@/components/document-types-master";
import { LeavePoliciesMaster } from "@/components/leave-policies-master";
import { ShiftsMaster } from "@/components/shifts-master";
import { PermissionGroupsMaster } from "@/components/permission-groups-master";

// --- Placeholder Components ---
// In the next steps, you will replace these with your actual table components.
// These are simple functional components in plain JavaScript.
const RolesTable = () => <RolesMaster />;
const PermissionsTable = () => <PermissionsMaster />;
const CompaniesTable = () => <CompaniesMaster />;
const DepartmentsTable = () => <DepartmentsMaster />;
const DesignationsTable = () => <DesignationsMaster />;
const LeaveTypesTable = () => <LeaveTypesMaster />;
const HolidaysTable = () => <HolidaysMaster />;
const DocumentTypesTable = () => <DocumentTypesMaster />;
const LeavePoliciesTable = () => <LeavePoliciesMaster />;
const ShiftsTable = () => <ShiftsMaster />;
const PermissionGroupsTable = () => <PermissionGroupsMaster />;

// --- Configuration for all the master tabs ---
// This approach keeps the main component clean and is very easy to manage.
const masterTabs = [
  {
    value: "roles",
    label: "Roles",
    description: "Manage user roles and their associated permissions.",
    component: <RolesTable />,
  },
  {
    value: "permissions",
    label: "Permissions",
    description: "Manage individual permissions that can be assigned to roles.",
    component: <PermissionsTable />,
  },
  {
    value: "permission-groups",
    label: "Permission Groups",
    description: "Group permissions together for easier management.",
    component: <PermissionGroupsTable />,
  },
  {
    value: "companies",
    label: "Companies",
    description:
      "Manage different companies or legal entities within the organization.",
    component: <CompaniesTable />,
  },
  {
    value: "departments",
    label: "Departments",
    description: "Manage organizational departments like Engineering, HR, etc.",
    component: <DepartmentsTable />,
  },
  {
    value: "designations",
    label: "Designations",
    description:
      "Manage job titles and designations like Software Engineer, Manager, etc.",
    component: <DesignationsTable />,
  },
  {
    value: "shifts",
    label: "Shifts",
    description: "Manage work shifts, timings, and policies.",
    component: <ShiftsTable />,
  },
  {
    value: "leave-types",
    label: "Leave Types",
    description:
      "Manage different types of leave (e.g., Sick, Casual, Earned).",
    component: <LeaveTypesTable />,
  },
  {
    value: "leave-policies",
    label: "Leave Policies",
    description:
      "Define and manage leave policies for different employee groups.",
    component: <LeavePoliciesTable />,
  },
  {
    value: "holidays",
    label: "Holidays",
    description: "Manage the official holiday calendar for the year.",
    component: <HolidaysTable />,
  },
  {
    value: "document-types",
    label: "Document Types",
    description:
      "Manage types of documents that can be uploaded (e.g., Passport, ID Card).",
    component: <DocumentTypesTable />,
  },
];

export default function Masters() {
  useSetPageTitle("Masters");

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Tabs defaultValue={masterTabs[0].value} className="w-full">
        {/* The list of triggers is generated dynamically from our config array */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 h-auto">
          {masterTabs.map((tab) => (
            <TabsTrigger
              className="cursor-pointer"
              key={tab.value}
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* The content for each tab is also generated dynamically */}
        {masterTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{tab.label}</CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">{tab.component}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// In a real application, you would move each placeholder component
// into its own file inside a `masters` sub-directory, e.g.,
// src/components/masters/RolesTable.jsx
