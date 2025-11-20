import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { useCheckIn, useCheckOut, useDashboardOverview } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  PieChart,
  User,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useHolidays } from "@/hooks/useMasters";
import { useEmployeesOnLeave } from "@/hooks/useEmployees";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Helper function to format dates
const formatHolidayDate = (dateString) => {
  const date = new Date(dateString);
  // Adjust for timezone differences by working with UTC dates
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return {
    month: utcDate.toLocaleString("en-US", { month: "short" }),
    day: utcDate.getDate(),
  };
};

export default function Dashboard() {
  useSetPageTitle("Dashboard");

  // Hooks for dashboard stats and check-in/out functionality
  const {
    data,
    isLoading: isDashboardStatLoading,
    isError: isDashboardStatError,
  } = useDashboardOverview();
  const { mutate: checkIn } = useCheckIn();
  const { mutate: checkOut } = useCheckOut();

  // Hooks for holidays and employees on leave
  const {
    data: holidaysData,
    isLoading: isHolidaysLoading,
    isError: isHolidaysError,
  } = useHolidays(1, 100);

  const {
    data: employeesOnLeaveData,
    isLoading: isEmployeesOnLeaveLoading,
    isError: isEmployeesOnLeaveError,
  } = useEmployeesOnLeave({ page: 1, limit: 100 });

  // State for controlling check-in/out button visibility
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours + minutes / 60;
      setCanCheckIn(currentTime >= 9.5 && currentTime <= 15);
      setCanCheckOut(currentTime >= 9.5 && currentTime <= 21.5);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for check-in and check-out
  const handleCheckIn = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        checkIn(
          {
            check_in_time: new Date().toLocaleTimeString("en-US", {
              hour12: false,
            }),
            latitude,
            longitude,
          },
          {
            onSuccess: () => toast.success("Checked in successfully!"),
            onError: (err) =>
              toast.error(err.response?.data?.message || "Failed to check in."),
          }
        );
      },
      (error) => toast.error("Could not get location: " + error.message)
    );
  };

  const handleCheckOut = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        checkOut(
          {
            check_out_time: new Date().toLocaleTimeString("en-US", {
              hour12: false,
            }),
            latitude,
            longitude,
          },
          {
            onSuccess: () => toast.success("Checked out successfully!"),
            onError: (err) =>
              toast.error(
                err.response?.data?.message || "Failed to check out."
              ),
          }
        );
      },
      (error) => toast.error("Could not get location: " + error.message)
    );
  };

  // Prepare data for rendering
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  const upcomingHolidays = (holidaysData?.data?.holidays || [])
    .filter((h) => new Date(h.date) >= today)
    .slice(0, 5); // Take the next 5 upcoming holidays

  const employeesOnLeave = employeesOnLeaveData?.data?.employees || [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Top Stat Cards: Check-in, Attendance, etc. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isDashboardStatLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))
        ) : (
          <>
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Check In Time"
              value={data?.data?.check_in || "Not clocked in"}
              icon={Clock}
              actions={
                !data?.data?.check_in &&
                canCheckIn && <Button onClick={handleCheckIn}>Check In</Button>
              }
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Check Out Time"
              value={data?.data?.check_out || "Not clocked out"}
              icon={Clock}
              actions={
                data?.data?.check_in &&
                !data?.data?.check_out &&
                canCheckOut && (
                  <Button onClick={handleCheckOut} variant="destructive">
                    Check Out
                  </Button>
                )
              }
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Attendance This Month"
              value={`${data?.data?.current_month_attendance || 0} Days`}
              icon={BarChart3}
            />
            <StatCard
              isDashboardStatError={isDashboardStatError}
              title="Leave Balance"
              value={`${data?.data?.leave_balance || 0} Days`}
              icon={PieChart}
            />
          </>
        )}
      </div>

      {/* Leave Request Overview Stat Cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Leave Request Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isDashboardStatLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))
          ) : (
            <>
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Total Requests"
                value={data?.data?.total_leave_requests || 0}
                icon={CalendarDays}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Approved"
                value={data?.data?.approved_leave_requests || 0}
                icon={CheckCircle2}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Pending"
                value={data?.data?.pending_leave_requests || 0}
                icon={HelpCircle}
              />
              <StatCard
                isDashboardStatError={isDashboardStatError}
                title="Rejected"
                value={data?.data?.rejected_leave_requests || 0}
                icon={XCircle}
              />
            </>
          )}
        </div>
      </div>

      {/* New Section: Holidays and Employees on Leave */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Holidays Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>
              A look at the next few company holidays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isHolidaysLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isHolidaysError ? (
              <p className="text-destructive">Could not load holidays.</p>
            ) : upcomingHolidays.length > 0 ? (
              <ul className="space-y-3">
                {upcomingHolidays.map((holiday) => {
                  const { month, day } = formatHolidayDate(holiday.date);
                  return (
                    <li key={holiday.id} className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <span className="text-sm font-medium">{month}</span>
                        <span className="text-xl font-bold">{day}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{holiday.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {holiday.description}
                        </p>
                      </div>
                      <Badge
                        variant={holiday.is_optional ? "outline" : "default"}
                      >
                        {holiday.is_optional ? "Optional" : "Public"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No upcoming holidays found.</p>
            )}
          </CardContent>
        </Card>

        {/* Employees on Leave Card */}
        <Card>
          <CardHeader>
            <CardTitle>Employees on Leave Today</CardTitle>
            <CardDescription>
              Team members who are out of office today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEmployeesOnLeaveLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isEmployeesOnLeaveError ? (
              <p className="text-destructive">
                Could not load employee leave data.
              </p>
            ) : employeesOnLeave.length > 0 ? (
              <ul className="space-y-4">
                {employeesOnLeave.map((employee) => (
                  <li key={employee.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={employee.profile?.profile_image_url}
                        alt={employee.username}
                      />
                      <AvatarFallback>
                        {employee.profile?.first_name?.[0]}
                        {employee.profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {employee.profile?.first_name}{" "}
                        {employee.profile?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.employment?.designation?.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No one is on leave today.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
