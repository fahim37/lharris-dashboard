"use client";

import { useEffect, useState } from "react";
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

interface Visit {
  id: string;
  clientName: string;
  staffName: string;
  date: string;
  type: string;
  status: string;
}

export function VisitPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isViewVisitOpen, setIsViewVisitOpen] = useState(false);
  const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  // Fetch visits from API
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/v1/visits/get-all-visit");
        if (!response.ok) {
          throw new Error("Failed to fetch visits");
        }
        const { data } = await response.json();
        const transformedVisits: Visit[] = data.map((visit: any) => ({
          id: visit._id,
          clientName: visit.client?.fullname || "N/A",
          staffName: visit.staff?.fullname || "Staff not assigned",
          date: visit.date,
          type: visit.type,
          status: visit.status,
        }));
        setVisits(transformedVisits);
      } catch (error) {
        console.error("Error fetching visits:", error);
        toast.error("Failed to load visits");
      }
    };

    fetchVisits();
  }, []);

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || visit.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddVisit = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/v1/visits/add-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: "client_id",
          staff: "staff_id",
          date: new Date().toISOString(),
          type: "Follow-up",
          status: "Scheduled",
        }),
      });
      if (!response.ok) throw new Error("Failed to add visit");
      const newVisit = await response.json();
      setVisits([...visits, {
        id: newVisit._id,
        clientName: newVisit.client?.fullname || "N/A",
        staffName: newVisit.staff?.fullname || "Staff not assigned",
        date: newVisit.date,
        type: newVisit.type,
        status: newVisit.status,
      }]);
      toast.success("Visit added successfully");
      setIsAddVisitOpen(false);
    } catch (error) {
      console.error("Error adding visit:", error);
      toast.error("Failed to add visit");
    }
  };

  const handleEditVisit = async () => {
    if (!currentVisit) return;
    try {
      const response = await fetch(`http://localhost:5001/api/v1/visits/update-visit/${currentVisit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: "client_id",
          staff: "staff_id",
          date: currentVisit.date,
          type: currentVisit.type,
          status: currentVisit.status,
        }),
      });
      if (!response.ok) throw new Error("Failed to update visit");
      const updatedVisit = await response.json();
      setVisits(visits.map((visit) =>
        visit.id === currentVisit.id
          ? {
            id: updatedVisit._id,
            clientName: updatedVisit.client?.fullname || "N/A",
            staffName: updatedVisit.staff?.fullname || "Staff not assigned",
            date: updatedVisit.date,
            type: updatedVisit.type,
            status: updatedVisit.status,
          }
          : visit
      ));
      toast.success("Visit updated successfully");
      setIsEditVisitOpen(false);
    } catch (error) {
      console.error("Error updating visit:", error);
      toast.error("Failed to update visit");
    }
  };

  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;
    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c"; // Adjust token retrieval as needed
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://localhost:5001/api/v1/visits/issues/delete-visit/${visitToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete visit");
      setVisits(visits.filter((visit) => visit.id !== visitToDelete));
      toast.success(`Visit deleted successfully`);
      setIsDeleteConfirmOpen(false);
      setVisitToDelete(null);
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error("Failed to delete visit");
      setIsDeleteConfirmOpen(false);
      setVisitToDelete(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Complete":
        return "bg-green-100 text-green-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <TableCell>
                      {new Date(visit.date).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        hour12: true,
                      })}
                    </TableCell>
                    <TableCell>{visit.type}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusClass(visit.status)}`}
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
                          onClick={() => {
                            setVisitToDelete(visit.id);
                            setIsDeleteConfirmOpen(true);
                          }}
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
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Routine Check">Routine Check</SelectItem>
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
              Visit Details
            </DialogTitle>
          </DialogHeader>
          {currentVisit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Client:</span>
                <span className="text-sm">{currentVisit.clientName}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Date & Time:</span>
                <span className="text-sm">
                  {new Date(currentVisit.date).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Staff:</span>
                <span className="text-sm">{currentVisit.staffName}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Visit Type:</span>
                <span className="text-sm">{currentVisit.type}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full inline-block w-fit ${getStatusClass(
                    currentVisit.status
                  )}`}
                >
                  {currentVisit.status}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-sm font-medium">Notes:</span>
                <span className="text-sm">No notes provided for this visit.</span>
              </div>
            </div>
          )}
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
          {currentVisit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-client" className="text-sm font-medium">
                  Client
                </label>
                <Select defaultValue={currentVisit.clientName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={currentVisit.clientName}>
                      {currentVisit.clientName}
                    </SelectItem>
                    <SelectItem value="Other Client">Other Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  defaultValue={new Date(currentVisit.date).toISOString().split("T")[0]}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-time" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="edit-time"
                  type="time"
                  defaultValue={new Date(currentVisit.date).toTimeString().slice(0, 5)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-staff" className="text-sm font-medium">
                  Staff
                </label>
                <Select defaultValue={currentVisit.staffName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={currentVisit.staffName}>
                      {currentVisit.staffName}
                    </SelectItem>
                    <SelectItem value="Other Staff">Other Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-visitType" className="text-sm font-medium">
                  Visit Type
                </label>
                <Select defaultValue={currentVisit.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Visit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Routine Check">Routine Check</SelectItem>
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
          )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Trash2 className="h-5 w-5" />
              </div>
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Are you sure you want to delete this visit? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisitToDelete(null)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteVisit}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}