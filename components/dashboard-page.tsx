"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import {
  Pencil,
  Eye,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCalendar } from "./dashboard-calendar";
import {
  getActivePlans,
  getMonthlyRevenue,
  getActiveDiscounts,
  getTotalClients,
  getTotalStaff,
  getActiveUsers,
  createVisit,
} from "@/lib/api";

// Dummy data
const recentActivity = [
  {
    id: "13560",
    date: "Today",
    time: "9:30 AM",
    user: "John Doe",
    email: "john.doe@royalhouse.com",
    action: "Login",
    status: "Active",
  },
  {
    id: "11500",
    date: "Today",
    time: "9:15 AM",
    user: "Jane Smith",
    email: "jane.smith@royalhouse.com",
    action: "Report Generated",
    status: "Active",
  },
  {
    id: "12118",
    date: "Yesterday",
    time: "4:45 PM",
    user: "Cameron Williamson",
    email: "cameron.w@royalhouse.com",
    action: "Visit Completed",
    status: "Active",
  },
];

const users = [
  {
    id: "13560",
    name: "John Doe",
    email: "john.doe@royalhouse.com",
    role: "Admin",
    status: "Active",
    lastLogin: "1 Day Ago",
  },
  {
    id: "11500",
    name: "Jane Doe",
    email: "jane.smith@royalhouse.com",
    role: "Staff",
    status: "Active",
    lastLogin: "2hr Ago",
  },
  {
    id: "12118",
    name: "Jane Smith",
    email: "jane.smith@royalhouse.com",
    role: "Client",
    status: "Active",
    lastLogin: "2hr Ago",
  },
  {
    id: "13617",
    name: "Jane Smith",
    email: "jane.smith@royalhouse.com",
    role: "Client",
    status: "Inactive",
    lastLogin: "2hr Ago",
  },
  {
    id: "10352",
    name: "Jane Smith",
    email: "jane.smith@royalhouse.com",
    role: "Client",
    status: "Active",
    lastLogin: "2hr Ago",
  },
];

export function DashboardPage() {
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState([
    {
      id: 1,
      title: "Total Visits",
      value: "128",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      id: 2,
      title: "Total Active Staff",
      value: "342",
      icon: Users,
      color: "text-green-600",
    },
    {
      id: 3,
      title: "Pending Tasks",
      value: "28",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      id: 4,
      title: "Incidents",
      value: "56",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]);

  // Form state for scheduling a visit
  const [visitForm, setVisitForm] = useState({
    client: "",
    staff: "",
    address: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // We'll use Promise.all to fetch multiple metrics in parallel
        const [totalClientsRes, totalStaffRes, activeUsersRes] =
          await Promise.all([
            getActivePlans().catch(() => ({ totalActivePlans: 0 })),
            getMonthlyRevenue().catch(() => ({ monthlyRevenue: 0 })),
            getActiveDiscounts().catch(() => ({ activeDiscounts: 0 })),
            getTotalClients().catch(() => ({ data: 0 })),
            getTotalStaff().catch(() => ({ data: 0 })),
            getActiveUsers().catch(() => ({ data: 0 })),
          ]);

        // Update stats with real data
        setStats([
          {
            id: 1,
            title: "Total Visits",
            value: "128",
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            id: 2,
            title: "Active Staff",
            value: totalStaffRes.data?.toString() || "0",
            icon: Users,
            color: "text-green-600",
          },
          {
            id: 3,
            title: "Active Clients",
            value: totalClientsRes.data?.toString() || "0",
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            id: 4,
            title: "Active Users",
            value: activeUsersRes.data?.toString() || "0",
            icon: AlertTriangle,
            color: "text-red-600",
          },
        ]);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast.error("Failed to load dashboard metrics");
      }
    };

    fetchMetrics();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm)
    );
  });

  const handleScheduleVisit = async () => {
    try {
      // Format the date and time for the API
      const dateTime = new Date(`${visitForm.date}T${visitForm.time}`);

      const visitData = {
        client: visitForm.client,
        staff: visitForm.staff,
        address: visitForm.address,
        date: dateTime.toISOString(),
        type: visitForm.type,
        notes: visitForm.notes,
      };

      // Call the API to create a visit
      await createVisit(visitData);

      toast.success("Visit scheduled successfully");
      setIsScheduleVisitOpen(false);

      // Reset form
      setVisitForm({
        client: "",
        staff: "",
        address: "",
        date: "",
        time: "",
        type: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error scheduling visit:", error);
      toast.error("Failed to schedule visit");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setVisitForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setVisitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to Royal House Security Admin"
      />

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.id} className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle
                  className={`text-sm ${stat.color} flex items-center`}
                >
                  <stat.icon className="h-4 w-4 mr-1" /> {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                className="bg-blue-950 hover:bg-blue-900"
                onClick={() => setIsScheduleVisitOpen(true)}
              >
                + Schedule Visit
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card className="bg-white h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Visits & Revenue Trends</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Daily
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50"
                        >
                          Weekly
                        </Button>
                        <Button variant="outline" size="sm">
                          Monthly
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end">
                      <div className="w-full h-[80%] bg-blue-50 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* This would be a chart in a real implementation */}
                          <div className="w-full h-1/2 border-t border-blue-300"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-100 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="bg-white h-full">
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 mr-2"></div>
                          <div>
                            <div className="text-sm font-medium">
                              {activity.user}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.action}
                            </div>
                            <div className="text-xs text-gray-400">
                              {activity.date}, {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-4">
              <DashboardCalendar />
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Customer Management</CardTitle>
                  <div className="w-64">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusClass(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">
                        Mar 15, 2025 | 9:00 AM | Sarah Wilson
                      </CardTitle>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          i % 4 === 0
                            ? "bg-blue-100 text-blue-800"
                            : i % 4 === 1
                            ? "bg-green-100 text-green-800"
                            : i % 4 === 2
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {i % 4 === 0
                          ? "Scheduled"
                          : i % 4 === 1
                          ? "Completed"
                          : i % 4 === 2
                          ? "Cancelled"
                          : "In Progress"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Client:</span>{" "}
                      {i % 3 === 0
                        ? "Cameron Williamson"
                        : i % 3 === 1
                        ? "Floyd Miles"
                        : "Jenny Wilson"}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Staff:</span>{" "}
                      {i % 2 === 0 ? "Ronald Richards" : "Devon Lane"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Visit Type:</span>{" "}
                      {i % 2 === 0 ? "Routine Check" : "Follow-up"}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Visit Dialog */}
      <Dialog open={isScheduleVisitOpen} onOpenChange={setIsScheduleVisitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-blue-950 text-white p-1 rounded-full mr-2">
                <Calendar className="h-5 w-5" />
              </div>
              Schedule Visit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="client" className="text-sm font-medium">
                Client
              </label>
              <Select
                value={visitForm.client}
                onValueChange={(value) => handleSelectChange("client", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="67f0b5e939baaffa730ffc11">
                    Cameron Williamson
                  </SelectItem>
                  <SelectItem value="client2">Floyd Miles</SelectItem>
                  <SelectItem value="client3">Jenny Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={visitForm.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="time"
                  type="time"
                  value={visitForm.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="staff" className="text-sm font-medium">
                Staff
              </label>
              <Select
                value={visitForm.staff}
                onValueChange={(value) => handleSelectChange("staff", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="67f3a0ec18e3e5c16fbda3cf">
                    Ronald Richards
                  </SelectItem>
                  <SelectItem value="staff2">Devon Lane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                placeholder="Enter address"
                value={visitForm.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="visitType" className="text-sm font-medium">
                Visit Type
              </label>
              <Select
                value={visitForm.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine check">Routine Check</SelectItem>
                  <SelectItem value="follow up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Input
                id="notes"
                placeholder="Add notes..."
                value={visitForm.notes}
                onChange={handleInputChange}
              />
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
              className="bg-blue-950 hover:bg-blue-900"
              onClick={handleScheduleVisit}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
