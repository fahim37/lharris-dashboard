"use client";

import {
  LayoutDashboard,
  Users,
  CalendarClock,
  ImageIcon,
  BarChart3,
  DollarSign,
  ClipboardList,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ActivePage =
  | "dashboard"
  | "users"
  | "visits"
  | "media"
  | "reports"
  | "pricing"
  | "audit";

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: React.Dispatch<React.SetStateAction<ActivePage>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "visits", label: "Visit & Tasks", icon: CalendarClock },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "audit", label: "Audit Logs", icon: ClipboardList },
  ];

  return (
    <div className="w-56 bg-[#0a1172] text-white flex flex-col h-svh sticky left-0 z-50">
      <div className="p-4 flex justify-center items-center">
        <div className="relative w-24 h-24">
          <Image
            src="/assets/lh-logo.png"
            alt="Royal House Security"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id as ActivePage)}
                  className={cn(
                    "flex items-center w-full px-4 py-2 text-sm rounded-md",
                    activePage === item.id
                      ? "bg-yellow-100 text-[#0a1172] font-medium"
                      : "text-white hover:bg-blue-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4">
        <button className="flex items-center w-full px-4 py-2 text-sm bg-yellow-100 text-[#0a1172] font-medium rounded-md">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
