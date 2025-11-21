"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

export function NavAdmin({ items }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <SidebarMenuItem key={item.menu.title}>
                <SidebarMenuButton
                  tooltip={item.menu.title}
                  className={`cursor-pointer hover:bg-sidebar-accent/50 transition-colors sidebar-tile ${isActive ? 'sidebar-active' : ''}`}
                  asChild
                >
                  <Link to={item.path}>
                    {item.menu.icon && <item.menu.icon />}
                    <span>{item.menu.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
