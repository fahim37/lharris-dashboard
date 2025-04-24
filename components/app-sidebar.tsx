"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  FileText,
  ImageIcon,
  BarChart,
  DollarSign,
  ClipboardList,
  LogOut,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/users", label: "Users", icon: Users },
    { path: "/visit-tasks", label: "Visit & Tasks", icon: FileText },
    { path: "/media", label: "Media", icon: ImageIcon },
    { path: "/reports", label: "Reports", icon: BarChart },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
    { path: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="sidebar h-screen w-[200px] flex flex-col">
      <div className="royal-logo">
        <div className="w-20 h-20 relative">
          <Image
            src="/assets/lh-logo.png"
            alt="Royal House Security"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex-1">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${pathname === item.path ? "active" : ""}`}
            onClick={() => handleNavigation(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div
        className="sidebar-item mb-4"
        onClick={() => {
          // Handle logout
          console.log("Logging out...");
        }}
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </div>
    </div>
  );
}
