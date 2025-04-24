"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Eye, Download } from "lucide-react"
import { toast } from "sonner"

// Dummy data
const logs = [
  {
    id: "103",
    timestamp: "Jan 15 15:29:31",
    user: "Cameron Williamson",
    role: "Client",
    activity: "User Login",
    status: "Successful",
  },
  {
    id: "103",
    timestamp: "Jan 15 15:29:31",
    user: "Floyd Miles",
    role: "Staff",
    activity: "Report Generation",
    status: "Failure",
  },
]

interface Log {
  id: string
  timestamp: string
  user: string
  role: string
  activity: string
  status: string
}

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isLogDetailsOpen, setIsLogDetailsOpen] = useState(false)
  const [currentLog, setCurrentLog] = useState<Log | null>(null)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.includes(searchTerm)
    const matchesUser = selectedUser ? log.user === selectedUser : true
    const matchesActivity = selectedActivity ? log.activity === selectedActivity : true
    const matchesStatus = selectedStatus ? log.status === selectedStatus : true

    return matchesSearch && matchesUser && matchesActivity && matchesStatus
  })

  const handleExport = () => {
    toast.success("Logs exported successfully")
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Successful":
        return "status-success"
      case "Failure":
        return "status-failure"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Admin Name" />

      <div className="p-4">
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
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="Cameron Williamson">Cameron Williamson</SelectItem>
                  <SelectItem value="Floyd Miles">Floyd Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="User Login">User Login</SelectItem>
                  <SelectItem value="Report Generation">Report Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Successful">Successful</SelectItem>
                  <SelectItem value="Failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} className="bg-[#0a1172] hover:bg-[#1a2182]">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.role}</TableCell>
                    <TableCell>{log.activity}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="action-button"
                        onClick={() => {
                          setCurrentLog(log)
                          setIsLogDetailsOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Showing 1 to 10 of 24 results</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" disabled className="pagination-nav disabled">
                <span className="sr-only">Previous page</span>
                &lt;
              </Button>
              <Button variant="outline" size="sm" className="pagination-item active">
                1
              </Button>
              <Button variant="outline" size="sm" className="pagination-item">
                2
              </Button>
              <Button variant="outline" size="sm" className="pagination-item">
                3
              </Button>
              <Button variant="outline" size="icon" className="pagination-nav">
                <span className="sr-only">Next page</span>
                &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={isLogDetailsOpen} onOpenChange={setIsLogDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Eye className="h-5 w-5" />
              </div>
              Log Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">ID:</span>
              <span className="text-sm">RH-12345</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">Timestamp:</span>
              <span className="text-sm">2023-03-27 09:45:11</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">User:</span>
              <span className="text-sm">Jane Smith</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">Role:</span>
              <span className="text-sm">Customer</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">Action:</span>
              <span className="text-sm">Data Update</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">IP Address:</span>
              <span className="text-sm">10.0.0.55</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">Device:</span>
              <span className="text-sm">Safari, macOS</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm px-2 py-1 rounded-full inline-block w-fit ${getStatusClass("Successful")}`}>
                Successful
              </span>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
