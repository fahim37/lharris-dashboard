import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Providers } from "./provider"; // ✅ Import your Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lharris Admin Dashboard",
  description: "Lharris Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
