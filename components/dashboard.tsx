"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { UsersPage } from "./users-page"
import { VisitsPage } from "./visits-page"
import { AuditLogsPage } from "./audit-logs-page"
import { PricingPage } from "./pricing-page"
import { MediaPage } from "./media-page"
import { ReportsPage } from "./reports-page"
import { DashboardPage } from "./dashboard-page"

type ActivePage = "dashboard" | "users" | "visits" | "media" | "reports" | "pricing" | "audit"

export function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />
      case "users":
        return <UsersPage />
      case "visits":
        return <VisitsPage />
      case "media":
        return <MediaPage />
      case "reports":
        return <ReportsPage />
      case "pricing":
        return <PricingPage />
      case "audit":
        return <AuditLogsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  )
}
