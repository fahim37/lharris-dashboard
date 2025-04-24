"use client"

import { useState } from "react"
import { PageHeader } from "./page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

// Dummy data
const reports = [
  {
    id: "103",
    date: "Mar 15, 2025",
    time: "9:00 AM",
    client: "Cameron Williamson",
    staff: "Ronald Richards",
    issue: "No Issue",
    visitType: "Routine Check",
  },
  {
    id: "103",
    date: "Mar 15, 2025",
    time: "9:00 AM",
    client: "Floyd Miles",
    staff: "Devon Lane",
    issue: "Issue Founded",
    visitType: "Follow-up",
  },
]

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedReportType, setSelectedReportType] = useState<string>("")

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.includes(searchTerm)
    const matchesStaff = selectedStaff ? report.staff === selectedStaff : true
    const matchesClient = selectedClient ? report.client === selectedClient : true
    const matchesReportType = selectedReportType ? report.visitType === selectedReportType : true

    return matchesSearch && matchesStaff && matchesClient && matchesReportType
  })

  const handleExport = () => {
    toast.success("Report exported successfully")
  }

  const getIssueClass = (issue: string) => {
    switch (issue) {
      case "No Issue":
        return "bg-green-100 text-green-800"
      case "Issue Founded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Admin Name" />

      <div className="p-4">
        <div className="bg-white rounded-md shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button className="bg-blue-950 hover:bg-blue-900" variant="default">
                12 Months
              </Button>
              <Button variant="outline">6 Months</Button>
              <Button variant="outline">30 Days</Button>
              <Button variant="outline">7 Days</Button>
            </div>
            <Button onClick={handleExport} className="bg-blue-950 hover:bg-blue-900">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Visits & Revenue</h3>
              <div className="aspect-[2/1] bg-white rounded-lg p-4 relative">
                <div className="absolute top-4 right-4 text-sm">
                  <div className="font-semibold">June 2021</div>
                  <div className="text-blue-600">$45,591</div>
                </div>
                <div className="h-full flex items-end">
                  <div className="w-full h-[80%] bg-blue-100 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* This would be a chart in a real implementation */}
                      <div className="w-full h-1/2 border-t border-blue-300"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-200 to-transparent"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <div>Feb</div>
                  <div>Mar</div>
                  <div>Apr</div>
                  <div>May</div>
                  <div>Jun</div>
                  <div>Jul</div>
                  <div>Aug</div>
                  <div>Sep</div>
                  <div>Oct</div>
                  <div>Nov</div>
                  <div>Dec</div>
                  <div>Jan</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Incident Types</h3>
              <div className="aspect-[2/1] bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 relative">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* This would be a pie chart in a real implementation */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-2xl font-bold">100%</div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-teal-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Burglar Alarms <span className="font-semibold">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Fire Alarms <span className="font-semibold">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Carbon Monoxide <span className="font-semibold">05%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Video Surveillance <span className="font-semibold">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Environmental Sensors <span className="font-semibold">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="Ronald Richards">Ronald Richards</SelectItem>
                  <SelectItem value="Devon Lane">Devon Lane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="Cameron Williamson">Cameron Williamson</SelectItem>
                  <SelectItem value="Floyd Miles">Floyd Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Routine Check">Routine Check</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Visit Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.time}</TableCell>
                    <TableCell>{report.client}</TableCell>
                    <TableCell>{report.staff}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getIssueClass(report.issue)}`}>
                        {report.issue}
                      </span>
                    </TableCell>
                    <TableCell>{report.visitType}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Showing 1 to 10 of 24 results</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" disabled>
                <span className="sr-only">Previous page</span>
                &lt;
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-yellow-100">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                3
              </Button>
              <Button variant="outline" size="icon">
                <span className="sr-only">Next page</span>
                &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
