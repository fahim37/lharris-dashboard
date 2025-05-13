"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaViewerDialog } from "@/components/media-viewer-dialog";
import { Eye, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/pagination";
import { toast } from "sonner";
import { AddMediaModal } from "@/components/add-media-modal";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";

interface Visit {
  visitId: ReactNode;
  _id: string;
  client: {
    _id: string;
    fullname: string;
    email: string;
  };
  staff: null | {
    _id: string;
    fullname: string;
    email: string;
  };
  date: string;
  status: string;
  address: string;
  visitType: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  issues: any[];
  type: string;
  notes: string;
}

interface Visits {
  data: Visit[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteMediaOpen, setIsDeleteMediaOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);

  const [visits, setVisits] = useState<Visits>({
    data: [],
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0,
    },
  });

  const session = useSession();
  const TOKEN = session.data?.accessToken;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  const getAllVisits = async (page: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/active-visit-client?page=${page}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        console.log("Error: ", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to fetch visits");
    }
  };

  useEffect(() => {
    if (TOKEN) {
      getAllVisits(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, TOKEN]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleViewMedia = (media: any) => {
    setSelectedMedia(media);
    setIsViewerOpen(true);
  };

  const handleDeleteVisit = async (visitId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/issues/delete-visit/${visitId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        console.log("Error: ", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await getAllVisits(page);
      toast.success("Visit deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete visit");
    }
    setIsDeleteMediaOpen(false);
    setVisitToDelete(null);
  };

  const openDeleteDialog = (visitId: string) => {
    setVisitToDelete(visitId);
    setIsDeleteMediaOpen(true);
  };

  const openModal = () => setIsModalOpen(true);

  return (
    <div className="">
      <PageHeader />
      <div className="space-y-4 px-5 mt-5">
        {visits?.data?.length === 0 ? (
          <div className="col-span-full text-center py-10">No media found</div>
        ) : (
          <div className="">
            <div className="flex justify-end mb-12">
              <Button
                className="bg-[#0a1172] hover:bg-[#1a2182]"
                onClick={openModal}
              >
                + Add Media
              </Button>
              <AddMediaModal
                medias={visits?.data}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
              />
            </div>

            <div className="shadow-[0px_10px_60px_0px_#0000001A] py-4 rounded-lg overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center pl-10">
                      ID
                    </TableHead>
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
                  {visits?.data?.map((item: Visit) => (
                    <TableRow key={item._id} className="text-center">
                      <TableCell className="font-medium pl-10">
                        {item.visitId}
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>
                      <TableCell>{item.client?.fullname}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {item?.staff ? (
                            <div>
                              <div className="font-medium">
                                {item?.staff?.fullname}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item?.staff?.email}
                              </div>
                            </div>
                          ) : (
                            "Not Assigned"
                          )}
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
                          {item?.issues?.length === 0
                            ? "No issue"
                            : "Issue found"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item?.type || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item?.issues?.length === 0
                          ? "No media"
                          : item?.issues?.[0]?.media
                            /* eslint-disable @typescript-eslint/no-explicit-any */
                            ?.map((m: any) => m.type)
                            .join(", ")}
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
                            onClick={() => openDeleteDialog(item._id)}
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
                currentPage={visits?.pagination?.currentPage || 1}
                totalPages={visits?.pagination?.totalPages || 1}
                onPageChange={handlePageChange}
                totalItems={visits?.pagination?.totalItems || 0}
                itemsPerPage={visits?.pagination?.itemsPerPage || 10}
              />
            </div>
          </div>
        )}
      </div>
      {selectedMedia && (
        <MediaViewerDialog
          media={selectedMedia}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}
      <Dialog open={isDeleteMediaOpen} onOpenChange={setIsDeleteMediaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] mb-5 text-white p-1 rounded-full mr-2">
                <Trash className="h-6 w-6" />
              </div>
              Are you sure you want to delete this visit?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-[#0a1172] hover:bg-[#1a2182]"
              onClick={() => visitToDelete && handleDeleteVisit(visitToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}