"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "./page-header";
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
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RevenueGrowthData {
  date: string;
  revenue: number;
}

interface RevenueGrowthResponse {
  status: boolean;
  message: string;
  data: RevenueGrowthData[];
}

interface VisitClient {
  _id: string;
  fullname: string;
  email: string;
}

interface VisitStaff {
  _id: string;
  fullname: string;
  email: string;
}

interface VisitIssueMedia {
  type: "photo" | "video";
  url: string;
  _id: string;
}

interface VisitIssue {
  place: string;
  issue: string;
  type: string;
  media: VisitIssueMedia[];
  notes: string;
  _id: string;
}

interface VisitData {
  _id: string;
  client: VisitClient;
  staff: VisitStaff | null;
  address: string;
  date: string;
  status: string;
  cancellationReason: string;
  type?: string;
  notes: string;
  isPaid: boolean;
  issues: VisitIssue[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface VisitResponse {
  success: boolean;
  data: VisitData[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedReportType, setSelectedReportType] = useState<string>("all");
  const [chartTimeframe, setChartTimeframe] = useState("12months");
  const [revenueData, setRevenueData] = useState<RevenueGrowthData[]>([]);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);
  const [visitsData, setVisitsData] = useState<VisitResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const fetchRevenueData = async (range: string) => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.error("Please sign in to view revenue data");
      return;
    }

    setIsRevenueLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/metrics/revenue-growth?range=${range}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data: RevenueGrowthResponse = await response.json();
      setRevenueData(data.data);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      // toast.error("Failed to load revenue data");
    } finally {
      setIsRevenueLoading(false);
    }
  };

  const fetchVisits = async (page: number = 1, limit: number = 2) => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.error("Please sign in to view visits data");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data: VisitResponse = await response.json();
      setVisitsData(data);
    } catch (err) {
      console.error("Error fetching visits:", err);
      toast.error("Failed to load visits data");
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeParam = (timeframe: string) => {
    switch (timeframe) {
      case "12months":
        return "1y";
      case "30days":
        return "30d";
      case "7days":
        return "7d";
      default:
        return "1y";
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchRevenueData(getTimeRangeParam(chartTimeframe));
    }
  }, [chartTimeframe, status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchVisits(currentPage);
    }
  }, [currentPage, status, session]);

  const exportToPDF = async () => {
    if (chartRef.current) {
      try {
        toast.info("Generating PDF...");
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("revenue-growth.pdf");
        toast.success("PDF downloaded successfully");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF");
      }
    }
  };

  const filteredVisits = visitsData?.data.filter((visit) => {
    const matchesSearch =
      visit.client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.staff?.fullname &&
        visit.staff.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      visit._id.includes(searchTerm) ||
      visit.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaff =
      selectedStaff === "all" ||
      (visit.staff?.fullname && visit.staff.fullname === selectedStaff);
    const matchesClient =
      selectedClient === "all" || visit.client.fullname === selectedClient;
    const matchesReportType =
      selectedReportType === "all" || visit.type === selectedReportType;

    return matchesSearch && matchesStaff && matchesClient && matchesReportType;
  }) || [];

  const uniqueClients = Array.from(
    new Set(visitsData?.data.map((visit) => visit.client.fullname))
  );
  const uniqueStaff = Array.from(
    new Set(
      visitsData?.data
        .filter((visit) => visit.staff)
        .map((visit) => visit.staff!.fullname)
    )
  );
  const uniqueVisitTypes = Array.from(
    new Set(visitsData?.data.map((visit) => visit.type).filter(Boolean))
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (visitsData?.meta.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleDeleteVisit = (visitId: string) => {
    setSelectedVisitId(visitId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVisit = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.error("Please sign in to delete visits");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/issues/delete-visit/${selectedVisitId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete visit");
      }
      await fetchVisits(currentPage);
      toast.success("Visit deleted successfully");
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error("Failed to delete visit");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getIssueClass = (issues: VisitIssue[]) => {
    if (issues.length === 0) {
      return "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const extractTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to view reports</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Admin Name" />
      <div className="p-4">
        <div className="bg-white rounded-md shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button
                variant={chartTimeframe === "12months" ? "default" : "outline"}
                className={`rounded-full text-xs ${chartTimeframe === "12months" ? "bg-blue-950" : ""}`}
                onClick={() => setChartTimeframe("12months")}
              >
                12 Months
              </Button>
              <Button
                variant={chartTimeframe === "30days" ? "default" : "outline"}
                className={`rounded-full text-xs ${chartTimeframe === "30days" ? "bg-blue-950" : ""}`}
                onClick={() => setChartTimeframe("30days")}
              >
                30 Days
              </Button>
              <Button
                variant={chartTimeframe === "7days" ? "default" : "outline"}
                className={`rounded-full text-xs ${chartTimeframe === "7days" ? "bg-blue-950" : ""}`}
                onClick={() => setChartTimeframe("7days")}
              >
                7 Days
              </Button>
            </div>
            <Button
              onClick={exportToPDF}
              className="bg-blue-950 hover:bg-blue-900"
              disabled={isRevenueLoading || revenueData.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Visits & Revenue</h3>
              <div ref={chartRef} className="bg-white rounded-lg p-4">
                <div className="mb-4">
                  <div className="text-xs text-gray-500">Revenue Growth</div>
                  <div className="text-xl font-bold">
                    {isRevenueLoading
                      ? "Loading..."
                      : revenueData.length > 0
                        ? `$${revenueData[revenueData.length - 1].revenue.toLocaleString()}`
                        : "$0"}
                  </div>
                  =                </div>
                <div className="h-[300px]">
                  {isRevenueLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.toLocaleString("default", {
                              month: "short",
                            })}`;
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return `${date.toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })}`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                          activeDot={{
                            r: 6,
                            fill: "#4f46e5",
                            stroke: "#c7d2fe",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Incident Types</h3>
              <div className="aspect-[2/1] bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 relative">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-2xl font-bold">100%</div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-teal-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Burglar Alarms <span className="font-semibold">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Fire Alarms <span className="font-semibold">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Carbon Monoxide <span className="font-semibold">05%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Video Surveillance <span className="font-semibold">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <div className="text-sm">
                      Environmental Sensors <span className="font-semibold">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by client, staff, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {uniqueStaff.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select
                value={selectedReportType}
                onValueChange={setSelectedReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueVisitTypes.map((type) => (
                    <SelectItem key={type} value={type!}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Visit Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading visits...
                    </TableCell>
                  </TableRow>
                ) : filteredVisits.length > 0 ? (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>{visit._id.substring(0, 6)}</TableCell>
                      <TableCell>{formatDate(visit.date)}</TableCell>
                      <TableCell>{extractTime(visit.date)}</TableCell>
                      <TableCell>{visit.client.fullname}</TableCell>
                      <TableCell>{visit.staff?.fullname || "Not Assigned"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getIssueClass(visit.issues)}`}
                        >
                          {visit.issues.length === 0 ? "No Issue" : "Issue Found"}
                        </span>
                      </TableCell>
                      <TableCell>{visit.type || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVisit(visit._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No visits found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {visitsData && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <div>
                Showing {(currentPage - 1) * visitsData.meta.itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * visitsData.meta.itemsPerPage,
                  visitsData.meta.totalItems
                )}{" "}
                of {visitsData.meta.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span className="sr-only">Previous page</span>
                  &lt;
                </Button>
                {Array.from(
                  { length: visitsData.meta.totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${currentPage === page ? "bg-yellow-100" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === visitsData.meta.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="sr-only">Next page</span>
                  &gt;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Visit Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteVisit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}