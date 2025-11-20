import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { PageTitleProvider } from "@/contexts/PageTitleContext";

export default function MainLayout() {
  return (
    <PageTitleProvider>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div
            className="flex flex-1 
      flex-col"
          >
            <div
              className="@container/main 
      flex flex-1 flex-col gap-2"
            >
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PageTitleProvider>
  );
}
