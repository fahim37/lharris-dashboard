"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Check, Plus, Pencil } from "lucide-react"
import { getActivePlans, getMonthlyRevenue, getActiveDiscounts, addPlan, getAllPlans } from "@/lib/api"

interface Plan {
  _id: string
  name: string
  price: number
  addsOnServices?: Array<{
    _id: string
    addOn: string
    price: number
    startDate: string | null
    endDate: string | null
  }>
}

export function PricingPage() {
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false)
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false)
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false)
  const [isEditDiscountOpen, setIsEditDiscountOpen] = useState(false)
  const [metrics, setMetrics] = useState({
    activePlans: 0,
    monthlyRevenue: 0,
    activeDiscounts: 0,
  })
  const [plans, setPlans] = useState<Plan[]>([])
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
  })

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

  const handleAddPackage = async () => {
    try {
      await addPlan(newPlan)
      toast.success("Package added successfully")
      setIsAddPackageOpen(false)
      // Refresh plans
      const plansRes = await getAllPlans()
      if (plansRes.data && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data)
      }
      // Reset form
      setNewPlan({
        name: "",
        price: 0,
      })
    } catch (error) {
      console.error("Error adding plan:", error)
      toast.error("Failed to add package")
    }
  }

  const handleEditPackage = () => {
    toast.success("Package updated successfully")
    setIsEditPackageOpen(false)
  }

  const handleAddDiscount = () => {
    toast.success("Discount added successfully")
    setIsAddDiscountOpen(false)
  }

  const handleEditDiscount = () => {
    toast.success("Discount updated successfully")
    setIsEditDiscountOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewPlan((prev) => ({
      ...prev,
      [id]: id === "price" ? Number.parseFloat(value) : value,
    }))
  }

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
              <div className="text-3xl font-bold">{metrics.activePlans}</div>
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

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> Active Discounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.activeDiscounts}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="plans">Security Plans</TabsTrigger>
              <TabsTrigger value="discounts">Discount Offers</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDiscountOpen(true)}
                className="hidden data-[state=active]:flex"
                data-state={document.querySelector('[data-state="active"][value="discounts"]') ? "active" : "inactive"}
              >
                + Add Discount
              </Button>
              <Button
                className="bg-[#0a1172] hover:bg-[#1a2182] hidden data-[state=active]:flex"
                data-state={document.querySelector('[data-state="active"][value="plans"]') ? "active" : "inactive"}
                onClick={() => setIsAddPackageOpen(true)}
              >
                + Add Package
              </Button>
            </div>
          </div>

          <TabsContent value="plans" className="mt-0">
            <div className="bg-white rounded-md shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <Card key={plan._id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between">
                          <span>{plan.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Popular</span>
                        </CardTitle>
                        <CardDescription>${plan.price} / month</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <ul className="space-y-2 text-sm">
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
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => setIsEditPackageOpen(true)}>
                          Edit
                        </Button>
                        <Button className="bg-[#0a1172] hover:bg-[#1a2182]" size="sm">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between">
                        <span>Plan 1</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Popular</span>
                      </CardTitle>
                      <CardDescription>$49 / month</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Basic security monitoring
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Weekly reports
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Email alerts
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setIsEditPackageOpen(true)}>
                        Edit
                      </Button>
                      <Button className="bg-[#0a1172] hover:bg-[#1a2182]" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discounts" className="mt-0">
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
              Add New Package
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Package Name
              </label>
              <Input id="name" placeholder="Enter package name" value={newPlan.name} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                placeholder="$0.00"
                type="number"
                value={newPlan.price || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="package-description" className="text-sm font-medium">
                Description
              </label>
              <Input id="package-description" placeholder="Enter description" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="package-features" className="text-sm font-medium">
                Features
              </label>
              <Input id="package-features" placeholder="Enter features (comma separated)" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={handleAddPackage}>
              Save
            </Button>
          </DialogFooter>
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
              Edit Package
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-package-name" className="text-sm font-medium">
                Package Name
              </label>
              <Input id="edit-package-name" defaultValue="Plan 1" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-package-price" className="text-sm font-medium">
                Price
              </label>
              <Input id="edit-package-price" defaultValue="$49.00" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-package-description" className="text-sm font-medium">
                Description
              </label>
              <Input id="edit-package-description" defaultValue="Basic security monitoring" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-package-features" className="text-sm font-medium">
                Features
              </label>
              <Input
                id="edit-package-features"
                defaultValue="Basic security monitoring, Weekly reports, Email alerts"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={handleEditPackage}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Discount Dialog */}
      <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Plus className="h-5 w-5" />
              </div>
              Add New Discount
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="discount-name" className="text-sm font-medium">
                Discount Name
              </label>
              <Input id="discount-name" placeholder="Enter discount name" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="discount-code" className="text-sm font-medium">
                Code
              </label>
              <Input id="discount-code" placeholder="Enter discount code" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="discount-amount" className="text-sm font-medium">
                Amount (%)
              </label>
              <Input id="discount-amount" placeholder="Enter discount percentage" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="discount-description" className="text-sm font-medium">
                Description
              </label>
              <Input id="discount-description" placeholder="Enter description" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={handleAddDiscount}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Discount Dialog */}
      <Dialog open={isEditDiscountOpen} onOpenChange={setIsEditDiscountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-[#0a1172] text-white p-1 rounded-full mr-2">
                <Pencil className="h-5 w-5" />
              </div>
              Edit Discount
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-discount-name" className="text-sm font-medium">
                Discount Name
              </label>
              <Input id="edit-discount-name" defaultValue="Discount 1" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-discount-code" className="text-sm font-medium">
                Code
              </label>
              <Input id="edit-discount-code" defaultValue="WELCOME10" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-discount-amount" className="text-sm font-medium">
                Amount (%)
              </label>
              <Input id="edit-discount-amount" defaultValue="10" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-discount-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-discount-description"
                defaultValue="10% off for new customers. Valid for the first 3 months."
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="bg-[#0a1172] hover:bg-[#1a2182]" onClick={handleEditDiscount}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
