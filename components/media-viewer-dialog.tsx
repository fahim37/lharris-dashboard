"use client";

import { X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { Input } from "./ui/input";

interface MediaViewerDialogProps {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    media: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export async function MediaViewerDialog({
    media,
    open,
    onOpenChange,
}: MediaViewerDialogProps) {

    const [noteOfVisit, setNoteOfVisit] = useState<string>("");

    console.log(media)


    // Approve visit
    const handleApproveVisit = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/visits/update-visit-status/${media._id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmEzNzdjNjA0NDRiZjIzZjQ5NjdlMSIsImlhdCI6MTc0NTU3MTk0MiwiZXhwIjoxNzQ2MTc2NzQyfQ.FtZBtHxKQ-anmoMHcZ-Fb67uNzLzwfJHYytPRL6Nch8`
                },
                body: JSON.stringify({ status: "completed", notes: noteOfVisit }),
            }
        )
    }


    // Reject visit
    const handleRejectVisit = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/visits/update-visit-status/${media._id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmEzNzdjNjA0NDRiZjIzZjQ5NjdlMSIsImlhdCI6MTc0NTU3MTk0MiwiZXhwIjoxNzQ2MTc2NzQyfQ.FtZBtHxKQ-anmoMHcZ-Fb67uNzLzwfJHYytPRL6Nch8`
                },
                body: JSON.stringify({ status: "cancelled", cancellationReason: noteOfVisit }),
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{media.issue}</DialogTitle>
                    </div>
                </DialogHeader>
                <div className="space-y-5">
                    <div className="text-sm text-muted-foreground">
                        <h2 className="capitalize text-3xl pb-4">{media?.issues[0]?.issue}</h2>
                        {new Date(media.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} | {new Date(media.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>

                    {media?.issues[0]?.media
                        ?
                        <Carousel className="aspect-video">
                            <CarouselContent>
                                {media?.issues[0]?.media?.map((item: any, index: number) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1 lg:h-96 w-full">
                                            {item.type == "photo" ?
                                                <Image
                                                    src={item.url}
                                                    alt={item.type}
                                                    width={600}
                                                    height={400}
                                                    className="w-full aspect-video"
                                                /> :
                                                <video controls className="w-full aspect-video">
                                                    <source src={item.url} />
                                                </video>
                                            }
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute top-full left-[44%] lg:left-[47%] -translate-x-1/2" />
                            <CarouselNext className="absolute top-full left-[54%] lg:left-[53%] -translate-x-1/2" />
                        </Carousel>
                        :
                        <div>No media found</div>
                    }

                    <div className="w-full p-5 bg-[#F5F7FA] text-black text-sm">
                        {/* Card Content */}
                        <div className="space-y-7">

                            {/* Client Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Client:</span>
                                <span className="">{media.client.fullname}</span>
                            </div>

                            {/* Date Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Date: </span>
                                <span className="">{new Date(media.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>

                            {/* Date & Time Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Time: </span>
                                <span className="">{new Date(media.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                            </div>

                            {/* Stuff Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Stuff:</span>
                                <span className="capitalize"> {media?.staff?.fullname || "Not Assigned"}</span>
                            </div>


                            {/* Address Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Address:</span>
                                <span className="capitalize">{media.address}</span>
                            </div>

                            {/* Visit Type Row */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Visit Type:</span>
                                <span className="capitalize">{media.visitType || "N/A"}</span>
                            </div>

                            {/* Issue Row with Button */}
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Issue:</span>

                                <Badge
                                    variant="default"
                                    className={
                                        media?.issues[0]?.issue
                                            ? "bg-[#E9BFBF] text-[#B93232]"
                                            : "bg-[#B3E9C9] text-[#033618]"
                                    }
                                >
                                    {media?.issues[0]?.issue ? "Issue Found" : "No issue"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl pb-4 font-medium">Note</h3>
                        <div className="p-5 bg-[#E6E6E6] text-black text-sm rounded-md">
                            <Input
                                onChange={(e) => setNoteOfVisit(e.target.value)}
                                placeholder="No incidents detected during this visit."
                                className="border-none shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0" />
                        </div>
                    </div>
                </div>
                <DialogFooter className="!justify-start">
                    <Button
                        className="bg-[#091057] hover:bg-[#091057] w-28"
                        onClick={handleApproveVisit}
                    >
                        Approve
                    </Button>
                    <Button
                        className="bg-[#BFBFBF] w-28"
                        onClick={handleRejectVisit}
                    >
                        Reject
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
