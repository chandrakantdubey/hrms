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
          "--sidebar-width": "14rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="glass">
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="mx-auto w-full max-w-screen-xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PageTitleProvider>
  );
}
