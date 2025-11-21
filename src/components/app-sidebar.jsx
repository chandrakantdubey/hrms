import React, { useMemo } from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { routeConfig } from "@/permissions";
import { NavAdmin } from "./nav-admin";
import { NavManager } from "./nav-manager";
import { LayoutDashboard } from "lucide-react";
import { NavHR } from "./nav-hr";

export function AppSidebar({ ...props }) {
  const { user, permissions, roles } = useAuth();

  const visibleMenuItems = useMemo(() => {
    // This helper checks if the user has the required permission for a route.
    // An empty permission string means the route is accessible to all.
    const hasPermission = (permission) =>
      !permission || permissions.includes(permission);

    // 1. Filter the entire route config to get only the routes that should be in the menu
    //    AND for which the user has the specific permission.
    const accessibleRoutes = routeConfig.filter(
      (route) => route.menu && hasPermission(route.permission)
    );

    // 2. Group the accessible routes by their 'group' property ('main', 'manager', etc.)
    return {
      main: accessibleRoutes.filter((r) => r.menu.group === "main"),
      manager: accessibleRoutes.filter((r) => r.menu.group === "manager"),
      hr: accessibleRoutes.filter((r) => r.menu.group === "hr"),
      admin: accessibleRoutes.filter((r) => r.menu.group === "admin"),
    };
  }, [permissions]);

  // --- DIRECT ROLE CHECKING (No hierarchy assumed) ---
  // We simply check if the required role exists in the user's roles array.
  const canSeeManagerNav = roles.includes("manager");
  const canSeeHrNav = roles.includes("hr");
  const canSeeAdminNav = roles.includes("admin");

  const userInfo = {
    name: user?.profile?.first_name || "User",
    email: user?.email || "",
    avatar: user?.profile?.profile_image_url || "",
  };

  return (
    <Sidebar
      collapsible="icon"
      className="glass"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitScrollbar: { display: 'none' }
      }}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <LayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">HRMS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto scrollbar-hide">
        <NavMain items={visibleMenuItems?.main} />

        {/* Render role-specific nav sections only if the user has that role */}
        {/* AND if there are any accessible menu items for that section. */}
        {canSeeManagerNav && visibleMenuItems?.manager.length > 0 && (
          <NavManager items={visibleMenuItems?.manager} />
        )}
        {canSeeHrNav && visibleMenuItems?.hr.length > 0 && (
          <NavHR items={visibleMenuItems?.hr} />
        )}
        {canSeeAdminNav && visibleMenuItems?.admin.length > 0 && (
          <NavAdmin items={visibleMenuItems?.admin} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
