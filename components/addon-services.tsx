"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Pencil, Trash, Plus } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddonService {
    _id: string
    name?: string
    addOn?: string
    price: number
    pack?: string
    description?: string
    startDate?: string | null
    endDate?: string | null
    planId?: string 
    updatedAt: string
    __v: number
}

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    price: z.number().min(0, { message: "Price must be a positive number." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    pack: z.enum(["weekly", "monthly", "daily", "patrol", "incident", "visit"]),
})

type FormData = z.infer<typeof formSchema>

export function AddonServices() {
    const [addonServices, setAddonServices] = useState<AddonService[]>([])
    const [isAddAddonOpen, setIsAddAddonOpen] = useState(false)
    const [isEditAddonOpen, setIsEditAddonOpen] = useState(false)
    const [isDeleteAddonOpen, setIsDeleteAddonOpen] = useState(false)
    const [selectedAddonId, setSelectedAddonId] = useState("")
    const [editingAddon, setEditingAddon] = useState<AddonService | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            description: "",
            pack: "daily",
        },
    })

    // Fetch all addon services
    const fetchAddonServices = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addsOnService/get-all-addsOnService`)
            const result = await response.json()

            if (result.status && Array.isArray(result.data)) {
                setAddonServices(result.data)
            } else {
                toast.error("Failed to fetch addon services")
            }
        } catch (error) {
            console.error("Error fetching addon services:", error)
            toast.error("Failed to load addon services")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAddonServices()
    }, [])

    // Add new addon service
    const handleAddAddon = async (data: FormData) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addsOnService/create-addsOnService`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (result.status) {
                toast.success("Add-on service added successfully")
                setIsAddAddonOpen(false)
                fetchAddonServices()
                form.reset()
            } else {
                toast.error(result.message || "Failed to add add-on service")
            }
        } catch (error) {
            // console.error("Error adding addon service:", error)
            toast.error(error as string || "Failed to add add-on service")
        }
    }

    // Update addon service
    const handleEditAddon = async (data: FormData) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/addsOnService/update-addsOnService/${selectedAddonId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            )

            const result = await response.json()

            if (result.status) {
                toast.success("Add-on service updated successfully")
                setIsEditAddonOpen(false)
                fetchAddonServices()
                form.reset()
            } else {
                toast.error(result.message || "Failed to update add-on service")
            }
        } catch (error) {
            console.error("Error updating addon service:", error)
            toast.error("Failed to update add-on service")
        }
    }

    // Delete addon service
    const handleDeleteAddon = async () => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/v1/addsOnService/delete-addsOnService/${selectedAddonId}`,
                {
                    method: "DELETE",
                },
            )

            const result = await response.json()

            if (result.status) {
                toast.success("Add-on service deleted successfully")
                setIsDeleteAddonOpen(false)
                setAddonServices((prevAddons) => prevAddons.filter((addon) => addon._id !== selectedAddonId))
                setSelectedAddonId("")
            } else {
                toast.error(result.message || "Failed to delete add-on service")
            }
        } catch (error) {
            // console.error("Error deleting addon service:", error)
            toast.error(error as string || "Failed to delete add-on service")
        }
    }

    const handleEditClick = (addon: AddonService) => {
        setSelectedAddonId(addon._id)
        setEditingAddon(addon)
        form.reset({
            name: addon.name || "",
            price: addon.price,
            description: addon.description || "",
            pack: (addon.pack as "weekly" | "monthly" | "daily") || "daily",
        })
        setIsEditAddonOpen(true)
    }

    return (
        <div className="w-full bg-white shadow-md mt-10 rounded p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#18181B]">Add-on Services</h3>
                <Button className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={() => setIsAddAddonOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add-on Service
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a1172]"></div>
                </div>
            ) : addonServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {addonServices.map((addon) => (
                        <Card key={addon._id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between">
                                    <span className="capitalize text-2xl pb-7">{addon.name || addon.addOn || "Add-on Service"}</span>
                                </CardTitle>
                                <CardDescription className="text-lg font-semibold text-[#000000] capitalize">
                                    ${addon.price} / {addon.pack || "service"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="">
                                    <h3>Details: </h3>
                                </div>
                                <div className="mt-2">{addon.description || "No description available"}</div>
                            </CardContent>
                            <CardFooter className="flex items-center gap-2 text-base">
                                <Button size="sm" onClick={() => handleEditClick(addon)} className="bg-[#091057] text-[#F7E39F]">
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setIsDeleteAddonOpen(true)
                                        setSelectedAddonId(addon._id)
                                    }}
                                    className="hover:bg-[#1a2182] bg-transparent border border-[#091057] text-[#091057] hover:text-[#F7E39F]"
                                >
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">No add-on services found. Add your first one!</div>
            )}

            {/* Add Addon Dialog */}
            <Dialog open={isAddAddonOpen} onOpenChange={setIsAddAddonOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                                <Plus className="h-5 w-5" />
                            </div>
                            Add New Add-on Service
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddAddon)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter service name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pack"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pack</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a billing period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="incident">Incident</SelectItem>
                                                <SelectItem value="patrol">Patrol</SelectItem>
                                                <SelectItem value="visit">Visit</SelectItem>

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="pt-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="bg-[#0a1172] hover:bg-[#1a2182]">
                                    Add
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Addon Dialog */}
            <Dialog open={isEditAddonOpen} onOpenChange={setIsEditAddonOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                                <Pencil className="h-5 w-5" />
                            </div>
                            Edit Add-on Service: {editingAddon?.name || editingAddon?.addOn}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEditAddon)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter service name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pack"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pack</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a billing period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="daily">Daily </SelectItem>
                                                <SelectItem value="incident">Incident</SelectItem>
                                                <SelectItem value="patrol">Patrol</SelectItem>
                                                <SelectItem value="visit">Visit</SelectItem>

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="pt-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="bg-[#0a1172] hover:bg-[#1a2182]">
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Addon Dialog */}
            <Dialog open={isDeleteAddonOpen} onOpenChange={setIsDeleteAddonOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <div className="bg-[#0a1172] mb-5 text-white p-1 rounded-full mr-2">
                                <Trash className="h-6 w-6" />
                            </div>
                            Are you sure you want to delete this add-on service?
                        </DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={handleDeleteAddon}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
