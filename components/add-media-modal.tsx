"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileUp } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"

interface AddMediaModalProps {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    medias: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
    email: z.string().min(1, "Client email is required"),
    place: z.string().min(1, "Address is required"),
    issue: z.string().min(1, "Issue is required"),
    type: z.string().min(1, "Type is required"),
    notes: z.string().optional(),
    issueDate: z.string().min(1, "Issue date is required"),
})

export function AddMediaModal({ open, onOpenChange, medias }: AddMediaModalProps) {
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            place: "",
            issue: "",
            type: "",
            notes: "",
            issueDate: "",
        },
    })

    const session = useSession();

    const TOKEN = session.data?.accessToken;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0])
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            // Add text fields
            formData.append("email", values.email)
            formData.append("place", values.place)
            formData.append("issue", values.issue)
            formData.append("type", values.type)
            formData.append("notes", values.notes || "")
            formData.append("issueDate", values.issueDate)

            // Add files if selected
            if (imageFile) {
                formData.append("image", imageFile)
            }

            if (videoFile) {
                formData.append("video", videoFile)
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/visits/issues/update-add-issue`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                    },
                    body: formData,
                },
            )

            if (response.ok) {
                onOpenChange(false)
                form.reset()
                setImageFile(null)
                setVideoFile(null)
            } else {
                console.error("Failed to submit form")
            }
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] md:max-w-[600px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#0a1172] rounded-full p-2 flex items-center justify-center">
                            <Upload className="text-white h-5 w-5" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-[#0a1172]">Add Media</DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 pt-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Client Email :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {
                                                    /* eslint-disable @typescript-eslint/no-explicit-any */
                                                    medias?.map((user: any, index: number) => (
                                                        <SelectItem key={index} value={user?.client?.email}>{user?.client?.email}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="issueDate"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Issue Date :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="place"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Address :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <FormControl>
                                            <Input placeholder="Address" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="issue"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Issue Founded :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <Select onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Issue found">Issue Found</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Type :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="routine check">Routine check</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                                <SelectItem value="follow up">Follow up</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                                    <FormLabel className="text-gray-700 sm:col-span-1">Notes :</FormLabel>
                                    <div className="sm:col-span-3">
                                        <FormControl>
                                            <Textarea placeholder="Enter notes here..." {...field} className="min-h-[80px]" />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                            <div className="text-gray-700 sm:col-span-1">Image :</div>
                            <div className="sm:col-span-3">
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    <span className="truncate">{imageFile ? imageFile.name : "Choose File"}</span>
                                    <FileUp className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                            <div className="text-gray-700 sm:col-span-1">Video :</div>
                            <div className="sm:col-span-3">
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    onChange={handleVideoChange}
                                    className="hidden"
                                    accept="video/*"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => videoInputRef.current?.click()}
                                >
                                    <span className="truncate">{videoFile ? videoFile.name : "Choose File"}</span>
                                    <FileUp className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="bg-[#0a1172] hover:bg-[#1a2182]">
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
