"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Check, Plus, Pencil, Trash } from "lucide-react"
import { getActivePlans, getMonthlyRevenue, getActiveDiscounts, addPlan, getAllPlans, deletePlan, updatePlan } from "@/lib/api"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Plan {
  _id: string
  name: string
  price: number
  description: string
  pack?: string
  addsOnServices?: Array<{
    _id: string
    addOn: string
    price: number
    startDate: string | null
    endDate: string | null
  }>
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Plan name must be at least 2 characters." }),
  price: z.number().min(0, { message: "Price must be a positive number." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  pack: z.enum(["weekly", "monthly", "daily"]),
})

type FormData = z.infer<typeof formSchema>


export function PricingPage() {
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false)
  const [isDeletePackageOpen, setIsDeletePackageOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [metrics, setMetrics] = useState({
    activePlans: 0,
    monthlyRevenue: 0,
    activeDiscounts: 0,
  })
  const [plans, setPlans] = useState<Plan[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      pack: "daily",
    },
  })

  console.log(metrics)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [activePlansRes, monthlyRevenueRes, activeDiscountsRes, plansRes] = await Promise.all([
          getActivePlans().catch(() => ({ totalActivePlans: 0 })),
          getMonthlyRevenue().catch(() => ({ monthlyRevenue: 0 })),
          getActiveDiscounts().catch(() => ({ activeDiscounts: 0 })),
          getAllPlans().catch(() => ({ data: [] })),
        ])

        setMetrics({
          activePlans: activePlansRes.totalActivePlans || 0,
          monthlyRevenue: monthlyRevenueRes.monthlyRevenue || 0,
          activeDiscounts: activeDiscountsRes.activeDiscounts || 0,
        })

        if (plansRes.data && Array.isArray(plansRes.data)) {
          setPlans(plansRes.data)
        }
      } catch (error) {
        console.error("Error fetching billing metrics:", error)
        toast.error("Failed to load billing metrics")
      }
    }
    fetchMetrics()
  }, [])

  const handleAddPackage = async (data: FormData) => {
    try {
      await addPlan(data)
      toast.success("Package added successfully")
      setIsAddPackageOpen(false)
      // Refresh plans
      const plansRes = await getAllPlans()
      if (plansRes.data && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data)
      }
      form.reset()
    } catch (error) {
      console.error("Error adding plan:", error)
      toast.error("Failed to add package")
    }
  }

  const handleDeletePlan = async () => {
    try {
      await deletePlan(selectedPlanId)
      toast.success("Plan deleted successfully")
      setIsDeletePackageOpen(false)
      setPlans((prevPlans) => prevPlans.filter((plan) => plan._id !== selectedPlanId))
      setSelectedPlanId("")
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast.error("Failed to delete plan")
    }
  }

  const handleEditPlan = async (data: FormData) => {
    try {
      await updatePlan(selectedPlanId, data)
      toast.success("Plan updated successfully")
      setIsEditPackageOpen(false)
      // Refresh plans
      const plansRes = await getAllPlans()
      if (plansRes.data && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error("Failed to update plan")
    }
  }

  // const handleEditClick = (plan: Plan) => {
  //   setSelectedPlanId(plan._id)
  //   form.reset({
  //     name: plan.name,
  //     price: plan.price,
  //     description: plan.description,
  //     pack: plan.pack as "weekly" | "monthly" | "daily",
  //   })
  //   setIsEditPackageOpen(true)
  // }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Billing" subtitle="Manage pricing plans and discounts" />

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> Total Active Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plans.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${metrics.monthlyRevenue}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="plans">Security Plans</TabsTrigger>
              <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                className="bg-[#0a1172] hover:bg-[#1a2182] data-[state=active]:flex"
                data-state={document.querySelector('[data-state="active"][value="plans"]') ? "active" : "inactive"}
                onClick={() => setIsAddPackageOpen(true)}
              >
                + Add Plans
              </Button>
            </div>
          </div>

          <TabsContent value="plans" className="mt-0">
            <div className="bg-white rounded-md shadow-sm p-6">
              <div className="">
                <h3 className="text-lg font-semibold pb-7 pl-1 text-[#18181B]">Plans</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <Card key={plan._id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between">
                          <span className="capitalize text-2xl pb-7">{plan.name}</span>
                        </CardTitle>
                        <CardDescription className="text-lg font-semibold text-[#000000] capitalize">${plan.price} / {plan.pack}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <ul className="space-y-2 text-sm pb-2">
                          <li className="text-base pb-1">{plan.description}</li>
                          {plan.addsOnServices &&
                            plan.addsOnServices.map((addon) => (
                              <li key={addon._id} className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                {addon.addOn} (${addon.price})
                              </li>
                            ))}
                          {(!plan.addsOnServices || plan.addsOnServices.length === 0) && (
                            <li className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                              Basic security monitoring
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex items-center gap-2 text-base">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsEditPackageOpen(true)
                            setSelectedPlanId(plan._id)
                          }
                          }
                          className="bg-[#091057] text-[#F7E39F]"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsDeletePackageOpen(true)
                            setSelectedPlanId(plan._id)
                          }}
                          className="hover:bg-[#1a2182] bg-transparent border border-[#091057] text-[#091057] hover:text-[#F7E39F]"
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div>No plans found</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment-history" className="mt-0">
            <div className="bg-white rounded-md shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>Discount 1</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">10% Off</span>
                    </CardTitle>
                    <CardDescription>WELCOME10</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      10% off for new customers. Valid for the first 3 months.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setIsEditDiscountOpen(true)}>
                      Edit
                    </Button>
                    <Button className="bg-[#0a1172] hover:bg-[#1a2182]" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>Discount 2</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">15% Off</span>
                    </CardTitle>
                    <CardDescription>ANNUAL15</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      15% off for annual subscriptions. Valid for all plans.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setIsEditDiscountOpen(true)}>
                      Edit
                    </Button>
                    <Button className="bg-[#0a1172] hover:bg-[#1a2182]" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>Discount 3</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">20% Off</span>
                    </CardTitle>
                    <CardDescription>LOYALTY20</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      20% off for loyal customers. Valid after 1 year of subscription.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setIsEditDiscountOpen(true)}>
                      Edit
                    </Button>
                    <Button className="bg-[#0a1172] hover:bg-[#1a2182]" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Package Dialog */}
      <Dialog open={isAddPackageOpen} onOpenChange={setIsAddPackageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Plus className="h-5 w-5" />
              </div>
              Add New Plan
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddPackage)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter package name" {...field} />
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Pencil className="h-5 w-5" />
              </div>
              Edit Plan
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditPlan)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter package name" {...field} />
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

      {/* Delete Package Dialog */}
      <Dialog open={isDeletePackageOpen} onOpenChange={setIsDeletePackageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] mb-5 text-white p-1 rounded-full mr-2">
                <Trash className="h-6 w-6" />
              </div>
              Are you sure you want to delete this package?
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
              onClick={handleDeletePlan}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
