"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router";

export function NavManager({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Manager</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.menu.title}>
              <SidebarMenuButton
                tooltip={item.menu.title}
                className="cursor-pointer"
                asChild
              >
                <Link to={item.path}>
                  {item.menu.icon && <item.menu.icon />}
                  <span>{item.menu.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
