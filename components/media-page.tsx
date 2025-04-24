"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Eye, Video, ImageIcon, Calendar } from "lucide-react"

// Dummy data
const mediaItems = [
  {
    id: "101",
    date: "Mar 15, 2025",
    time: "9:00 AM",
    clientName: "Cameron Williamson",
    staffName: "Ronald Richards",
    mediaType: "Video",
    visitType: "Routine Check",
    status: "No Issue",
  },
  {
    id: "102",
    date: "Mar 15, 2025",
    time: "9:00 AM",
    clientName: "Floyd Miles",
    staffName: "Devon Lane",
    mediaType: "Photo",
    visitType: "Follow-up",
    status: "Issue Founded",
  },
]

interface MediaItem {
  id: string
  date: string
  time: string
  clientName: string
  staffName: string
  mediaType: string
  visitType: string
  status: string
}

export function MediaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMediaType, setSelectedMediaType] = useState<string>("")
  const [selectedVisitType, setSelectedVisitType] = useState<string>("")
  const [isViewMediaOpen, setIsViewMediaOpen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm)
    const matchesDate = selectedDate ? item.date === selectedDate : true
    const matchesMediaType = selectedMediaType ? item.mediaType === selectedMediaType : true
    const matchesVisitType = selectedVisitType ? item.visitType === selectedVisitType : true

    return matchesSearch && matchesDate && matchesMediaType && matchesVisitType
  })

  const getStatusClass = (status: string) => {
    switch (status) {
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
      <PageHeader title="Media" subtitle="Manage media files and recordings" />

      <div className="p-4">
        <Tabs defaultValue="list" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4 mb-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-[200px]">
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="Mar 15, 2025">Mar 15, 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Media</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Photo">Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={selectedVisitType} onValueChange={setSelectedVisitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visit Types</SelectItem>
                    <SelectItem value="Routine Check">Routine Check</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <TabsContent value="list" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Media Type</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell>{item.clientName}</TableCell>
                        <TableCell>{item.staffName}</TableCell>
                        <TableCell>{item.mediaType}</TableCell>
                        <TableCell>{item.visitType}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCurrentMedia(item)
                                setIsViewMediaOpen(true)
                              }}
                            >
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
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      setCurrentMedia(item)
                      setIsViewMediaOpen(true)
                    }}
                  >
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {item.mediaType === "Video" ? (
                        <Video className="h-12 w-12 text-gray-400" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">{item.clientName}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.date}, {item.time}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="font-medium mr-1">Visit:</span>
                        {item.visitType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* View Media Dialog */}
      <Dialog open={isViewMediaOpen} onOpenChange={setIsViewMediaOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-blue-950 text-white p-1 rounded-full mr-2">
                {currentMedia?.mediaType === "Video" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>
              {currentMedia?.mediaType}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
              {currentMedia?.mediaType === "Video" ? (
                <Video className="h-16 w-16 text-gray-400" />
              ) : (
                <ImageIcon className="h-16 w-16 text-gray-400" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Client:</span>
                  <span className="text-sm">{currentMedia?.clientName}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{currentMedia?.date}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Time:</span>
                  <span className="text-sm">{currentMedia?.time}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Staff:</span>
                  <span className="text-sm">{currentMedia?.staffName}</span>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Visit Type:</span>
                  <span className="text-sm">{currentMedia?.visitType}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Status:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full inline-block w-fit ${getStatusClass(currentMedia?.status || "")}`}
                  >
                    {currentMedia?.status}
                  </span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm">1234 Washington St, Suite 204, Seattle 98101</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Note:</h3>
              <div className="bg-gray-100 p-3 rounded-md text-sm">No incidents detected during this visit.</div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" type="button">
              Download
            </Button>
            <DialogClose asChild>
              <Button type="button" className="bg-blue-950 hover:bg-blue-900">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
