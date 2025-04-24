"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

// Dummy data
const visits = [
  {
    id: "19560",
    clientName: "Annette Black",
    staffName: "Guy Hawkins",
    dateTime: "15 May 2023 8:30 am",
    visitType: "Follow-up",
    status: "Scheduled",
  },
  {
    id: "11500",
    clientName: "Kristin Watson",
    staffName: "Darlene Robertson",
    dateTime: "15 May 2023 9:30 am",
    visitType: "Routine Check",
    status: "In Progress",
  },
  {
    id: "12118",
    clientName: "Jenny Wilson",
    staffName: "Esther Howard",
    dateTime: "15 May 2023 9:30 am",
    visitType: "Follow-up",
    status: "Complete",
  },
  {
    id: "13617",
    clientName: "Jane Cooper",
    staffName: "Arlene McCoy",
    dateTime: "15 May 2023 8:45 am",
    visitType: "Routine Check",
    status: "Canceled",
  },
  {
    id: "10352",
    clientName: "Floyd Miles",
    staffName: "Wade Warren",
    dateTime: "15 May 2023 8:30 am",
    visitType: "Follow-up",
    status: "Scheduled",
  },
];

interface Visit {
  id: string;
  clientName: string;
  staffName: string;
  dateTime: string;
  visitType: string;
  status: string;
}

export function VisitPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isViewVisitOpen, setIsViewVisitOpen] = useState(false);
  const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.id.includes(searchTerm);
    const matchesStatus = selectedStatus
      ? visit.status === selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  const handleAddVisit = () => {
    toast.success("Visit added successfully");
    setIsAddVisitOpen(false);
  };

  const handleEditVisit = () => {
    toast.success("Visit updated successfully");
    setIsEditVisitOpen(false);
  };

  const handleDeleteVisit = (visitId: string) => {
    toast.success(`Visit ${visitId} deleted successfully`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "status-scheduled";
      case "In Progress":
        return "status-in-progress";
      case "Complete":
        return "status-complete";
      case "Canceled":
        return "status-cancelled";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsAddVisitOpen(true)}
              className="bg-[#0a1172] hover:bg-[#1a2182]"
            >
              + Add Visit
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.id}</TableCell>
                    <TableCell>{visit.clientName}</TableCell>
                    <TableCell>{visit.staffName}</TableCell>
                    <TableCell>{visit.dateTime}</TableCell>
                    <TableCell>{visit.visitType}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusClass(
                          visit.status
                        )}`}
                      >
                        {visit.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="action-button"
                          onClick={() => {
                            setCurrentVisit(visit);
                            setIsViewVisitOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="action-button"
                          onClick={() => {
                            setCurrentVisit(visit);
                            setIsEditVisitOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="action-button"
                          onClick={() => handleDeleteVisit(visit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Visit Dialog */}
      <Dialog open={isAddVisitOpen} onOpenChange={setIsAddVisitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Eye className="h-5 w-5" />
              </div>
              Add New Visit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="client" className="text-sm font-medium">
                Client
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annette">Annette Black</SelectItem>
                  <SelectItem value="kristin">Kristin Watson</SelectItem>
                  <SelectItem value="jenny">Jenny Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input id="date" type="date" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input id="time" type="time" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="staff" className="text-sm font-medium">
                Staff
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guy">Guy Hawkins</SelectItem>
                  <SelectItem value="darlene">Darlene Robertson</SelectItem>
                  <SelectItem value="esther">Esther Howard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="visitType" className="text-sm font-medium">
                Visit Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="routine">Routine Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Input id="notes" placeholder="Add notes..." />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-[#0a1172] hover:bg-[#1a2182]"
              onClick={handleAddVisit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Visit Dialog */}
      <Dialog open={isViewVisitOpen} onOpenChange={setIsViewVisitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Eye className="h-5 w-5" />
              </div>
              Visit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Client:</span>
              <span className="text-sm">{currentVisit?.clientName}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Date:</span>
              <span className="text-sm">
                {currentVisit?.dateTime.split(" ").slice(0, 3).join(" ")}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Time:</span>
              <span className="text-sm">
                {currentVisit?.dateTime.split(" ").slice(3).join(" ")}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Staff:</span>
              <span className="text-sm">{currentVisit?.staffName}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Visit Type:</span>
              <span className="text-sm">{currentVisit?.visitType}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span
                className={`text-sm px-2 py-1 rounded-full inline-block w-fit ${getStatusClass(
                  currentVisit?.status || ""
                )}`}
              >
                {currentVisit?.status}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-sm font-medium">Notes:</span>
              <span className="text-sm">No notes provided for this visit.</span>
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

      {/* Edit Visit Dialog */}
      <Dialog open={isEditVisitOpen} onOpenChange={setIsEditVisitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Pencil className="h-5 w-5" />
              </div>
              Edit Visit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-client" className="text-sm font-medium">
                Client
              </label>
              <Select defaultValue="client1">
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">
                    {currentVisit?.clientName}
                  </SelectItem>
                  <SelectItem value="client2">Other Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-date" className="text-sm font-medium">
                Date
              </label>
              <Input id="edit-date" type="date" defaultValue="2023-05-15" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-time" className="text-sm font-medium">
                Time
              </label>
              <Input id="edit-time" type="time" defaultValue="08:30" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-staff" className="text-sm font-medium">
                Staff
              </label>
              <Select defaultValue="staff1">
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff1">
                    {currentVisit?.staffName}
                  </SelectItem>
                  <SelectItem value="staff2">Other Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-visitType" className="text-sm font-medium">
                Visit Type
              </label>
              <Select
                defaultValue={currentVisit?.visitType
                  .toLowerCase()
                  .replace(/\s+/g, "-")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="routine-check">Routine Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </label>
              <Input id="edit-notes" placeholder="Add notes..." />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-[#0a1172] hover:bg-[#1a2182]"
              onClick={handleEditVisit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
