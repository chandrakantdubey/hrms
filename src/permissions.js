// src/permissions.js
import {
  BarChart,
  Bell,
  Folder,
  IndianRupee,
  LayoutDashboard,
  Mails,
  Settings,
  User,
  UserPlus,
  Users,
  Users2Icon,
} from "lucide-react";

/**
 * This is the single source of truth for all routes and their permissions.
 * - 'path': The URL path.
 * - 'permission': The exact permission string required to access this path.
 *   An empty string "" means the route is accessible to all logged-in users.
 * - 'menu': An object defining how this route appears in the sidebar.
 *   - 'title': The link text.
 *   - 'icon': The Lucide icon component.
 *   - 'group': The sidebar section ('main', 'manager', 'hr', 'admin').
 */
export const routeConfig = [
  // --- Main Navigation (for everyone) ---
  {
    path: "/",
    permission: "view dashboard",
    menu: { title: "Dashboard", icon: LayoutDashboard, group: "main" },
  },
  {
    path: "/profile",
    permission: "",
    menu: { title: "Profile", icon: User, group: "main" },
  },
  {
    path: "/attendance",
    permission: "view attendances",
    menu: { title: "Attendance", icon: BarChart, group: "main" },
  },
  {
    path: "/leaves",
    permission: "view leave requests",
    menu: { title: "Leaves", icon: Folder, group: "main" },
  },
  {
    path: "/team",
    permission: "view team",
    menu: { title: "Team", icon: Users, group: "main" },
  },

  // --- Manager Navigation ---
  {
    path: "/approvals",
    permission: "approve leave requests",
    menu: { title: "Approvals", icon: Mails, group: "manager" },
  },

  // --- HR Navigation ---
  {
    path: "/employees",
    permission: "view employees",
    menu: { title: "Employees", icon: Users2Icon, group: "hr" },
  },
  {
    path: "/employees/:id",
    permission: "view employees" /* No menu item for this sub-route */,
  },
  {
    path: "/add-employee",
    permission: "create employees",
    menu: { title: "Add Employee", icon: UserPlus, group: "hr" },
  },
  {
    path: "/announcements",
    permission: "view announcements",
    menu: { title: "Announcements", icon: Bell, group: "hr" },
  },

  // --- Admin Navigation ---
  {
    path: "/payroll",
    permission: "view payroll",
    menu: { title: "Payroll", icon: IndianRupee, group: "admin" },
  },
  {
    path: "/masters",
    permission: "view roles",
    menu: { title: "Masters", icon: Settings, group: "admin" },
  }, // Assuming 'view roles' is a good gatekeeper for all masters

  // --- Routes without Menu Items ---
  // These are accessible if the user has permission but don't show in the sidebar.
  { path: "/login", permission: "" },
  { path: "/requests", permission: "" }, // Add specific permission if needed
  { path: "*", permission: "" }, // Not Found page
];
