"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaViewerDialog } from "@/components/media-viewer-dialog";
import { Eye, Download, Delete, Edit, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/pagination";
import { toast } from "react-toastify";
import { Toaster } from "sonner";
import { AddMediaModal } from "@/components/add-media-modal";

// "_id": "681060874ab5fce75ace01dc",
// "client": {
//     "_id": "67fa377c60444bf23f4967e1",
//     "fullname": "sojib",
//     "email": "sozibbdcalling2025@gmail.com"
// },
// "staff": {
//     "_id": "6808d94166b86dee825b33d0",
//     "fullname": "Fahim",
//     "email": "emon@gmail.com"
// },
// "address": "123 Elm Street, Springfield",
// "date": "2025-04-30T10:00:00.000Z",
// "status": "confirmed",
// "cancellationReason": "",
// "notes": "fahim ke add kora holo",
// "isPaid": true,
// "issues": [],
// "createdAt": "2025-04-29T05:15:51.364Z",
// "updatedAt": "2025-04-30T07:06:39.159Z",
// "__v": 0,
// "type": "emergency"

interface Visit {
  _id: string;
  client: {
    _id: string;
    fullname: string;
    email: string;
  },
  staff: null | {
    _id: string;
    fullname: string;
    email: string;
  },
  date: string;
  status: string;
  address: string;
  visitType: string;
  issues: any[];
  type: string;
  notes: string;
}

interface Visits {
  data: Visit[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }
}

export default function MediaPage() {

  const [page, setPage] = useState(1)

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const [visits, setVisits] = useState<Visits>({
    data: [],
    meta: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0
    }
  });

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmEzNzdjNjA0NDRiZjIzZjQ5NjdlMSIsImlhdCI6MTc0NTU3MTk0MiwiZXhwIjoxNzQ2MTc2NzQyfQ.FtZBtHxKQ-anmoMHcZ-Fb67uNzLzwfJHYytPRL6Nch8";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };



  useEffect(() => {
    const getAllVisits = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit`,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          console.log("Error: ", response.status)
        }

        const data = await response.json();
        setVisits(data);

      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    };
    getAllVisits();
  }, []);


  console.log(visits)

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewMedia = (media: any) => {
    setSelectedMedia(media);
    setIsViewerOpen(true);
  };

  const handleDeleteVisit = async (visitId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/visits/issues/delete-visit/${visitId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      console.log("Error: ", response.status)
    } else {
      toast.success("Visit deleted successfully");
    }
  }


  console.log(visits)



  return (
    <div className="space-y-4 px-20 mt-16">
      <div className="">
        {visits?.data?.length === 0 ? (
          <div className="col-span-full text-center py-10">
            No media found
          </div>
        ) : (

          <div className="">
            <div className="flex justify-end mb-12">
              <Button
                className="bg-[#0a1172] hover:bg-[#1a2182] h-12 px-6"
                onClick={openModal}
              >
                + Add Media
              </Button>
              <AddMediaModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            </div>

            <div className="shadow-[0px_10px_60px_0px_#0000001A] py-4 rounded-lg overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center pl-10">ID</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Visit Time</TableHead>
                    <TableHead className="text-center">Client</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead className="text-center">Issue</TableHead>
                    <TableHead className="text-center">Visit Type</TableHead>
                    <TableHead className="text-center">Media Type</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits?.data?.map((item: Visit, i: number) => (
                    <TableRow key={item._id} className="text-center">
                      <TableCell className="font-medium pl-10 ">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </TableCell>
                      <TableCell>
                        {item.client?.fullname}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {item?.staff ?
                            <div>
                              <div className="font-medium">
                                {item?.staff?.fullname}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item?.staff?.email}
                              </div>
                            </div>
                            :
                            "Not Assigned"
                          }

                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "default"
                              : item.status === "cancelled"
                                ? "destructive"
                                : "outline"
                          }
                          className={
                            item?.issues?.length === 0
                              ? "bg-[#B3E9C9] text-[#033618]"
                              : "bg-[#E9BFBF] text-[#B93232]"
                          }
                        >
                          {item?.issues?.length === 0 ? "No issue" : "Issue found"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{item?.type || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item?.issues?.length === 0 ? "No media" : `${item?.issues?.[0]?.media?.[0]?.type}, ${item?.issues?.[0]?.media?.[1]?.type}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMedia(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVisit(item._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationComponent
                currentPage={visits?.meta?.currentPage || 1}
                totalPages={visits?.meta?.totalPages || 1}
                onPageChange={handlePageChange}
                totalItems={visits?.meta?.totalItems || 0}
                itemsPerPage={visits?.meta?.itemsPerPage || 0}
              />
              <Toaster />
            </div>
          </div>
        )}
      </div>
      {
        selectedMedia && (
          <MediaViewerDialog
            media={selectedMedia}
            open={isViewerOpen}
            onOpenChange={setIsViewerOpen}
          />
        )
      }
    </div>
  );
}
