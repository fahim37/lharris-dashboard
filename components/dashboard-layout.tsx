"use client";

import { usePathname } from "next/navigation";
import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideSidebarRoutes = ["/login"];

  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <SidebarProvider>
      {!shouldHideSidebar && <AppSidebar />}
      <SidebarInset className="bg-gray-50">{children}</SidebarInset>
    </SidebarProvider>
  );
}
