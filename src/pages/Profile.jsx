import { useRef } from "react";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { useUserProfile, useUpdateProfilePicture } from "@/hooks/useUser"; // <-- Updated imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPayrollTable } from "@/components/tables";

// Component for the top profile header card
const ProfileHeader = ({ user, onProfilePictureChange }) => {
  const fileInputRef = useRef(null);
  const employment = user?.employment || {};

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col md:flex-row items-center p-6 gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 md:w-32 md:h-32">
            <AvatarImage
              src={
                user?.profile?.profile_image_url || "/placeholder-avatar.jpg"
              }
              alt={user?.username}
            />
            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={onProfilePictureChange}
            accept="image/*"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Edit profile picture"
          >
            ✏️
          </Button>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <p className="text-muted-foreground">
            {employment.designation?.name || "N/A"} at{" "}
            {employment.department?.name || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for a single info field
const InfoField = ({ label, value }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="font-bold text-wrap">{value || "N/A"}</p>
  </div>
);

// Component for the Personal Info tab
const PersonalInfoCard = ({ profile, user }) => (
  <Card>
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <InfoField label="Username" value={user?.username} />
      <InfoField label="Email" value={user?.email} />
      <InfoField label="Phone No" value={user?.phone_no} />
      <InfoField label="First Name" value={profile?.first_name} />
      <InfoField label="Last Name" value={profile?.last_name} />
      <InfoField label="Gender" value={profile?.gender} />
      <InfoField label="Date of Birth" value={profile?.date_of_birth} />
      <InfoField label="Marital Status" value={profile?.marital_status} />
      <InfoField label="Blood Group" value={profile?.blood_group} />
      <InfoField label="Address" value={profile?.address} />
      <InfoField label="City" value={profile?.city} />
      <InfoField label="State" value={profile?.state} />
      <InfoField label="Country" value={profile?.country} />
      <InfoField label="Postal Code" value={profile?.postal_code} />
    </CardContent>
  </Card>
);

// Component for the Employment Data tab
const EmploymentDetailsCard = ({ employment }) => (
  <Card>
    <CardHeader>
      <CardTitle>Employment Details</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <InfoField label="Employee Code" value={employment?.code} />
      <InfoField label="Company" value={employment?.company?.name} />
      <InfoField label="Designation" value={employment?.designation?.name} />
      <InfoField label="Department" value={employment?.department?.name} />
      <InfoField label="Status" value={employment?.status} />
      <InfoField label="Type" value={employment?.type} />
      <InfoField label="Joining Date" value={employment?.joining_date} />
      <InfoField
        label="Confirmation Date"
        value={employment?.confirmation_date}
      />
      <InfoField label="Office Email" value={employment?.office_email} />
      <InfoField label="Office Phone No" value={employment?.office_phone_no} />
      <InfoField label="Leave Policy" value={employment?.leave_policy?.name} />
      <InfoField label="Shift" value={employment?.shift?.name} />
      <InfoField
        label="Reporting To"
        value={employment?.reporting_to?.username}
      />
    </CardContent>
  </Card>
);

// Component for the Documents tab
const DocumentsCard = ({ documents }) => (
  <Card>
    <CardHeader>
      <CardTitle>Documents</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {documents && documents.length > 0 ? (
        documents.map((doc, index) => (
          <div
            key={doc.id || index}
            className="flex flex-col gap-1 p-4 border rounded-lg"
          >
            <InfoField label="Document Type" value={doc.type_name} />
            <div>
              <Label>Document</Label>
              <a
                href={doc.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-500 hover:underline font-medium"
              >
                View Document
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="col-span-full text-muted-foreground">
          No documents available.
        </p>
      )}
    </CardContent>
  </Card>
);

// --- Main Profile Component ---

export default function Profile() {
  useSetPageTitle("My Profile");

  // --- HOOK INTEGRATION ---
  // Use the new, direct hooks
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useUserProfile();

  const { mutateAsync: updateProfilePicture } = useUpdateProfilePicture();

  const handleProfilePictureChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        // Use the destructured mutateAsync function directly
        await updateProfilePicture(file);
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to update profile picture."
        );
        console.error(error); // It's good practice to log the actual error
      }
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div>Loading Profile...</div>
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-red-500">
        <div>Error loading profile data. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <ProfileHeader
        user={userProfile?.data}
        onProfilePictureChange={handleProfilePictureChange}
      />

      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger className="cursor-pointer" value="personal-info">
            Personal Info
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="employment-data">
            Employment
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="documents">
            Documents
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="payroll">
            Payroll
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info">
          <PersonalInfoCard
            profile={userProfile?.data?.profile}
            user={userProfile}
          />
        </TabsContent>

        <TabsContent value="employment-data">
          <EmploymentDetailsCard employment={userProfile?.data?.employment} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsCard documents={userProfile?.data?.documents} />
        </TabsContent>

        <TabsContent value="payroll">
          <UserPayrollTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
