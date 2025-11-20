import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { useUserTeam } from "@/hooks/useUser";
import { Mail, Phone, User } from "lucide-react";

const TeamMemberCard = ({ member }) => {
  const designation = member?.employment?.designation?.name || "N/A";
  const department = member?.employment?.department?.name || "N/A";
  const reportingTo = member?.employment?.reporting_to?.username || "N/A";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          {member?.username}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={member?.profile?.profile_image_url}
              alt={member?.username}
            />
            <AvatarFallback>
              {member?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{designation}</p>
            <p className="text-muted-foreground">{department}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${member?.email}`} className="hover:underline">
              {member?.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{member?.phone_no || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Reports to: {reportingTo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Team() {
  useSetPageTitle("Team");
  const { data, isLoading, isError } = useUserTeam();

  if (isLoading) {
    return <div className="p-4">Loading team members...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading team members. Please try again.
      </div>
    );
  }
  const teamMembers = data?.data || [];

  if (teamMembers.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">You have no team members.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      {teamMembers?.map((member) => (
        <TeamMemberCard key={member?.id} member={member} />
      ))}
    </div>
  );
}
