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

interface Staff {
  _id: string;
  fullname: string;
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
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [addFormData, setAddFormData] = useState({
    clientEmail: "",
    staff: "",
    address: "",
    date: "",
    time: "",
    type: "",
  });
  const [editFormData, setEditFormData] = useState({
    clientEmail: "",
    staff: "",
    address: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });

  // Fetch visits and staff from API
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c";
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch visits");
        }
        const { data } = await response.json();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const transformedVisits: Visit[] = data.map((visit: any) => ({
          id: visit._id,
          clientName: visit.client?.fullname || "N/A",
          staffName: visit.staff?.fullname || "Staff not assigned",
          date: visit.date,
          type: visit.type || "N/A",
          status: visit.status,
        }));
        setVisits(transformedVisits);
      } catch (error) {
        console.error("Error fetching visits:", error);
        toast.error("Failed to load visits");
      }
    };

    const fetchStaff = async () => {
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c";
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-staff`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch staff");
        }
        const { data } = await response.json();
        setStaffList(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Failed to load staff list");
      }
    };

    fetchVisits();
    fetchStaff();
  }, []);

  // Populate edit form when currentVisit changes
  useEffect(() => {
    if (currentVisit) {
      const visitDate = new Date(currentVisit.date);
      setEditFormData({
        clientEmail: "nm.bdcalling@gmail.com",
        staff: "6808d94166b86dee825b33d0",
        address: "123 Elm Street, Springfield",
        date: visitDate.toISOString().split("T")[0],
        time: visitDate.toTimeString().slice(0, 5),
        type: currentVisit.type,
        notes: "",
      });
    }
  }, [currentVisit]);

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || visit.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddVisit = async () => {
    if (!addFormData.clientEmail || !addFormData.staff || !addFormData.address || !addFormData.date || !addFormData.time || !addFormData.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c";
      if (!token) throw new Error("No authentication token found");

      // Combine date and time into ISO string
      const isoDateTime = new Date(`${addFormData.date}T${addFormData.time}:00Z`).toISOString();

      const payload = {
        clientEmail: addFormData.clientEmail,
        staff: addFormData.staff,
        address: addFormData.address,
        date: isoDateTime,
        type: addFormData.type,
      };
      console.log("Create visit payload:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/create-visit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add visit");
      }
      const newVisit = await response.json();
      console.log("Create visit response:", newVisit);

      // Map staff ID to fullname for display
      const staffName = staffList.find((staff) => staff._id === newVisit.data.staff)?.fullname || "Staff not assigned";

      setVisits([
        ...visits,
        {
          id: newVisit.data._id,
          clientName: "N/A", // Placeholder; fetch client fullname if needed
          staffName,
          date: newVisit.data.date,
          type: newVisit.data.type || "N/A",
          status: newVisit.data.status || "pending",
        },
      ]);
      toast.success("Visit added successfully");
      setIsAddVisitOpen(false);
      setAddFormData({
        clientEmail: "",
        staff: "",
        address: "",
        date: "",
        time: "",
        type: "",
      });
    } catch (error) {
      console.error("Error adding visit:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to add visit");
      } else {
        toast.error("Failed to add visit");
      }
    }
  };

  const handleEditVisit = async () => {
    if (!currentVisit) return;
    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c";
      if (!token) throw new Error("No authentication token found");

      // Combine date and time into ISO string
      const isoDateTime = new Date(`${editFormData.date}T${editFormData.time}:00Z`).toISOString();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/update-visit/${currentVisit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientEmail: editFormData.clientEmail,
          staff: editFormData.staff,
          address: editFormData.address,
          date: isoDateTime,
          type: editFormData.type,
          notes: editFormData.notes,
        }),
      });
      if (!response.ok) throw new Error("Failed to update visit");
      const updatedVisit = await response.json();
      const staffName = staffList.find((staff) => staff._id === updatedVisit.data.staff)?.fullname || "Staff not assigned";
      setVisits(
        visits.map((visit) =>
          visit.id === currentVisit.id
            ? {
              id: updatedVisit.data._id,
              clientName: updatedVisit.data.client?.fullname || "N/A",
              staffName,
              date: updatedVisit.data.date,
              type: updatedVisit.data.type || "N/A",
              status: updatedVisit.data.status || "pending",
            }
            : visit
        )
      );
      toast.success("Visit updated successfully");
      setIsEditVisitOpen(false);
      setCurrentVisit(null);
    } catch (error) {
      console.error("Error updating visit:", error);
      toast.error("Failed to update visit");
    }
  };

  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;
    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4MmVlMDAyYjZkZWZjZDk4ZDdiYyIsImlhdCI6MTc0NjAwMjQwNywiZXhwIjoxNzQ2NjA3MjA3fQ.FhKV2MYzKhDxM9ETnYS8DyHiMQx_97v4RnNggyA5l1c";
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/issues/delete-visit/${visitToDelete}`, {
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
              <label htmlFor="clientEmail" className="text-sm font-medium">
                Client Email
              </label>
              <Input
                id="clientEmail"
                value={addFormData.clientEmail}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, clientEmail: e.target.value })
                }
                placeholder="Enter client email"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="staff" className="text-sm font-medium">
                Staff
              </label>
              <Select
                value={addFormData.staff}
                onValueChange={(value) => {
                  console.log("Selected staff ID:", value);
                  setAddFormData({ ...addFormData, staff: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                value={addFormData.address}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={addFormData.date}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, date: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={addFormData.time}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, time: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="visitType" className="text-sm font-medium">
                Visit Type
              </label>
              <Select
                value={addFormData.type}
                onValueChange={(value) => {
                  console.log("Selected visit type:", value);
                  setAddFormData({ ...addFormData, type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine check">Routine Check</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
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
                <label htmlFor="edit-clientEmail" className="text-sm font-medium">
                  Client Email
                </label>
                <Input
                  id="edit-clientEmail"
                  value={editFormData.clientEmail}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, clientEmail: e.target.value })
                  }
                  placeholder="Enter client email"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-staff" className="text-sm font-medium">
                  Staff
                </label>
                <Select
                  value={editFormData.staff}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, staff: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-time" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editFormData.time}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, time: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-visitType" className="text-sm font-medium">
                  Visit Type
                </label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Visit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine check">Routine Check</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-notes" className="text-sm font-medium">
                  Notes
                </label>
                <Input
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  placeholder="Add notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentVisit(null)}
              >
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
              Are you sure you want to delete this visit? This action cannot be
              undone.
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