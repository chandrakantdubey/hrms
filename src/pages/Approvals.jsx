import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveApprovals } from "@/components/leave-approvals";
import { AttendanceApprovals } from "@/components/attendance-approvals";

export default function Approvals() {
  useSetPageTitle("Approvals");

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Tabs defaultValue="leave-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="cursor-pointer" value="leave-requests">
            Leave Requests
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="attendance-requests">
            Attendance Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave-requests" className="mt-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <LeaveApprovals />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance-requests" className="mt-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <AttendanceApprovals />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
