import type React from "react"
import { PageHeader } from "@/components/page-header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Audit Logs" subtitle="View system activity logs" />
      {children}
    </div>
  )
}
