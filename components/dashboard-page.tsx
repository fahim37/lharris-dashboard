"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, Calendar, Clock, Edit, Eye, Trash2, FileText } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { PageHeader } from "./page-header"

// Define types for our metrics data
interface MetricsData {
  activeUsers: number
  totalVisits: number
  pendingVisits: number
  totalSecurityStaff: number
  totalAdmin: number
  confirmVisits: number
  inProgress: number
}

// Define types for our visits API response
interface VisitClient {
  _id: string
  fullname: string
  email: string
}

interface VisitStaff {
  _id: string
  fullname: string
  email: string
}

interface VisitIssueMedia {
  type: "photo" | "video"
  url: string
  _id: string
}

interface VisitIssue {
  issue: string
  place: string
  type: string
  media: VisitIssueMedia[]
  notes: string
  _id: string
}

interface VisitData {
  _id: string
  client: VisitClient
  staff: VisitStaff
  address: string
  date: string
  status: string
  cancellationReason: string
  type?: string
  notes: string
}

interface VisitResponse {
  success: boolean
  data: VisitData[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

interface SpecificVisitResponse {
  _id: string
  client: {
    _id: string
    fullname: string
    password: string
    email: string
    role: string
    isVerified: boolean
    status: string
    createdAt: string
    updatedAt: string
    __v: number
    lastActive: string
  }
  staff?: {
    _id: string
    fullname: string
    email: string
  }
  address?: string
  date?: string
  status?: string
  cancellationReason?: string
  type?: string
  notes?: string
  isPaid?: boolean
  issues?: VisitIssue[]
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface UserInfo {
  _id: string
  fullname: string
  email: string
}

export interface PlanInfo {
  _id: string
  name: string
  price: number
}

export interface RecentActivityItem {
  _id: string
  user: UserInfo
  visit: string | null
  plan?: PlanInfo
  amount: number
  status: "completed" | "pending" | "failed"
  transactionId: string
  paymentMethod: "stripe" | "paypal" | "cash"
  createdAt: string
  paymentDate: string
  __v: number
}

export interface RecentActivityResponse {
  data: RecentActivityItem[]
}

interface RevenueGrowthData {
  date: string
  revenue: number
}

interface RevenueGrowthResponse {
  status: boolean
  message: string
  data: RevenueGrowthData[]
}

// Update the UserResponse interface to match the provided API response format
interface UserResponse {
  status: boolean
  message: string
  data: UserData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

interface UserData {
  _id: string
  fullname: string
  email: string
  role: "admin" | "client" | "staff" | "user" | "moderator"
  status: "active" | "inactive"
  lastActive: string
}

interface StaffMember {
  _id: string
  fullname: string
  email: string
  role: string
}

interface EditVisitData {
  staff: string
  type: string
  notes: string
}

interface AllMetrics {
  activeUsersCount: number
  totalVisits: number
  pendingVisits: number
  totalSecurityStaff: number
  totalAdmin: number
  confirmedVisitCount: number
  completedVisitCount: number
}

interface User {
  _id: string
  fullname: string
  email: string
  role: string
}

// Interface for each notification object in the data array
interface Notification {
  _id: string
  userId: User
  type: string
  message: string
  isRead: boolean
  createdAt: string
  __v: number
  displayUser: User
  time?: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [visitSearchTerm, setVisitSearchTerm] = useState("")
  const [chartTimeframe, setChartTimeframe] = useState("12months")
  const [metrics, setMetrics] = useState<MetricsData>({
    activeUsers: 0,
    totalVisits: 0,
    pendingVisits: 0,
    totalSecurityStaff: 0,
    totalAdmin: 0,
    confirmVisits: 0,
    inProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [editUserData, setEditUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "client" as "client" | "admin" | "staff",
  })
  const [visitsData, setVisitsData] = useState<VisitResponse | null>(null)
  const [specificVisit, setSpecificVisit] = useState<SpecificVisitResponse | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState("")
  const [isDeleteVisitDialogOpen, setIsDeleteVisitDialogOpen] = useState(false)
  const [visitStatusFilter, setVisitStatusFilter] = useState<string>("all")
  const [isEditVisitDialogOpen, setIsEditVisitDialogOpen] = useState(false)
  const [editVisitData, setEditVisitData] = useState<EditVisitData>({
    staff: "",
    type: "",
    notes: "",
  })
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Pagination states for User Management tab
  const [currentUserPage, setCurrentUserPage] = useState<number>(1)
  const [totalUserPages, setTotalUserPages] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)
  // Pagination states for Visits tab
  const [currentVisitPage, setCurrentVisitPage] = useState<number>(1)
  const [totalVisitPages, setTotalVisitPages] = useState<number>(1)
  const [visitsPerPage] = useState<number>(10)

  const [metricsData, setMetricsData] = useState<AllMetrics | null>(null)
  // console.log("Metrics Data:", metricsData);

  const [revenueData, setRevenueData] = useState<RevenueGrowthData[]>([])
  const [isRevenueLoading, setIsRevenueLoading] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const session = useSession()
  const token = session?.data?.accessToken

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // State for the overview tab visit filter
  const [overviewVisitStatusFilter, setOverviewVisitStatusFilter] = useState<string>("all")
  const [isOverviewVisitsLoading, setIsOverviewVisitsLoading] = useState(false)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

  // Debounce function for search
  /* eslint-disable @typescript-eslint/no-explicit-any */

  // Debounced search handler
  const debouncedSearch = useCallback((value: string) => {
    const handler = setTimeout(() => {
      setVisitSearchTerm(value);
      setCurrentVisitPage(1);
    }, 500);
  
    return () => clearTimeout(handler);
  }, [setVisitSearchTerm, setCurrentVisitPage]) as (value: string) => void;

  // Fetch metrics data from API
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/metrics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        const data = await response.json()
        setMetricsData(data?.data)

        // Update metrics with data from API
        setMetrics({
          activeUsers: data?.data?.activeUsersCount || 128,
          totalVisits: data?.data?.totalVisits || 342,
          pendingVisits: data?.data?.pendingVisits ?? 12,
          totalSecurityStaff: data?.data?.totalStaffMembers || 342,
          totalAdmin: data?.data?.totalAdmins || 28,
          confirmVisits: data?.data?.confirmVisits || 128,
          inProgress: data?.data?.inProgress || 9,
        })
        // setError(null)
      } catch (err) {
        console.error("Error fetching metrics:", err)
        // setError("Failed to load metrics data. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [token])

  const [recentData, setRecentData] = useState<RecentActivityResponse | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/metrics/recent-user-activity`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch")
        }

        const data = await res.json()
        setRecentData(data)
      } catch (err) {
        console.error("Error:", err)
        // toast.error(err instanceof Error ? err.message : String(err))
      }
    }

    fetchActivity()
  }, [token])

  const [userData, setUserData] = useState<UserData[]>([])

  const fetchUsers = useCallback(async () => {
    try {
      // Build query parameters including filters
      const queryParams = new URLSearchParams({
        page: currentUserPage.toString(),
        limit: itemsPerPage.toString(),
      })

      // Add role filter if not "all"
      if (roleFilter !== "all") {
        queryParams.append("role", roleFilter)
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter)
      }

      // Add search term if present
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm.trim())
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/all-user?${queryParams.toString()}`

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch")
      }

      const response: UserResponse = await res.json()

      if (response.status) {
        setUserData(response.data)
        if (response.pagination) {
          setTotalUserPages(response.pagination.totalPages)
          setCurrentUserPage(response.pagination.currentPage)
        }
      } else {
        throw new Error(response.message || "Failed to fetch users")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err) || "Failed to fetch users")
    }
  }, [currentUserPage, roleFilter, statusFilter, searchTerm, token, itemsPerPage])

  // Update the useEffect dependency array to include roleFilter, statusFilter, and searchTerm
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab, token, currentUserPage, roleFilter, statusFilter, searchTerm, fetchUsers])

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit`
        const queryParams = new URLSearchParams({
          page: currentVisitPage.toString(),
          limit: "10",
        })

        if (visitStatusFilter !== "all") {
          queryParams.append("status", visitStatusFilter)
        }

        // Add search term to query params if it exists
        if (visitSearchTerm.trim()) {
          queryParams.append("search", visitSearchTerm.trim())
        }

        const apiUrl = `${baseUrl}?${queryParams.toString()}`

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch visits")
        }

        const data: VisitResponse = await res.json()
        setVisitsData(data)
        if (data.meta) {
          setTotalVisitPages(data.meta.totalPages)
          setCurrentVisitPage(data.meta.currentPage)
        }
      } catch (err) {
        console.error("Error fetching visits:", err)
        toast.error(err instanceof Error ? err.message : String(err))
      }
    }

    if (activeTab === "visits") {
      fetchVisits()
    }
  }, [activeTab, currentVisitPage, visitStatusFilter, visitSearchTerm, token])

  const handleStatusFilterChange = (newFilter: string) => {
    setVisitStatusFilter(newFilter)
    setCurrentVisitPage(1) // This will trigger the fetch with correct page
  }

  // Fetch staff members for the edit form
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-staff`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch staff members")
        }

        const data = await res.json()
        setStaffMembers(data.data || [])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err) || "Error fetching staff members:")
      }
    }

    if (isEditVisitDialogOpen) {
      fetchStaffMembers()
    }
  }, [isEditVisitDialogOpen, token])

  // Replace the filteredUsers calculation with this simpler version since filtering is now handled by the API
  const filteredUsers = userData

  // Handle overview visit status filter change
  const handleOverviewVisitStatusFilterChange = (value: string) => {
    setOverviewVisitStatusFilter(value)
  }

  // Update the useEffect for fetching visits in the Overview tab
  useEffect(() => {
    const fetchVisitsForOverview = async () => {
      if (activeTab === "overview") {
        setIsOverviewVisitsLoading(true)
        try {
          // Build query parameters including filters
          const queryParams = new URLSearchParams({
            limit: "10",
          })

          // Add status filter if not "all"
          if (overviewVisitStatusFilter !== "all") {
            queryParams.append("status", overviewVisitStatusFilter)
          }

          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit?${queryParams.toString()}`

          const res = await fetch(apiUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!res.ok) {
            throw new Error("Failed to fetch visits")
          }

          const data: VisitResponse = await res.json()
          setVisitsData(data)
        } catch (err) {
          console.error("Error fetching visits for overview:", err)
        } finally {
          setIsOverviewVisitsLoading(false)
        }
      }
    }

    fetchVisitsForOverview()
  }, [activeTab, token, overviewVisitStatusFilter])

  // Get status class for styling
  const getStatusClass = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800"

    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus.includes("active")) return "bg-green-100 text-green-800"
    if (normalizedStatus.includes("inactive")) return "bg-red-100 text-red-800"
    if (normalizedStatus.includes("scheduled")) return "bg-blue-100 text-blue-800"
    if (normalizedStatus.includes("progress")) return "bg-yellow-100 text-yellow-800"
    if (normalizedStatus.includes("complete")) return "bg-green-100 text-green-800"
    if (normalizedStatus.includes("cancelled")) return "bg-red-100 text-red-800"
    if (normalizedStatus.includes("confirm")) return "bg-green-100 text-green-800"
    if (normalizedStatus.includes("pending")) return "bg-yellow-100 text-yellow-800"

    return "bg-gray-100 text-gray-800"
  }

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (user: UserData) => {
    setSelectedUserId(user._id)
    setEditUserData({
      fullname: user.fullname,
      email: user.email,
      password: "",
      role: user.role as "admin" | "client" | "staff",
    })
    setIsEditDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-user/${selectedUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Update the user list after successful deletion
      setUserData(userData.filter((user) => user._id !== selectedUserId))
      toast.success("User deleted successfully")
    } catch (error) {
      // console.error("Error deleting user:", error)
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-user/${selectedUserId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUserData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      // Update the user list with the edited user
      setUserData(userData.map((user) => (user._id === selectedUserId ? { ...user, ...editUserData } : user)))

      toast.success("User updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsEditDialogOpen(false)
    }
  }

  const handleViewVisit = async (visitId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/get-specific-visit/${visitId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visit details")
      }

      const data = await response.json()
      setSpecificVisit(data.data || data)
      setIsViewDialogOpen(true)
    } catch (error) {
      // console.error("Error fetching visit details:", error)
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }

  const handleDeleteVisit = (visitId: string) => {
    setSelectedVisitId(visitId)
    setIsDeleteVisitDialogOpen(true)
  }

  const confirmDeleteVisit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/issues/delete-visit/${selectedVisitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete visit")
      }

      // Update the visits list after successful deletion
      if (visitsData) {
        setVisitsData({
          ...visitsData,
          data: visitsData.data.filter((visit) => visit._id !== selectedVisitId),
        })
      }
      toast.success("Visit deleted successfully")
    } catch (error) {
      // console.error("Error deleting visit:", error)
      toast.error(error instanceof Error ? error.message : String(error) || "Failed to delete visit")
    } finally {
      setIsDeleteVisitDialogOpen(false)
    }
  }

  // Handle edit visit button click
  const handleEditVisit = (visit: VisitData) => {
    setSelectedVisitId(visit._id)
    setEditVisitData({
      staff: visit.staff?._id || "",
      type: visit.type || "routine check",
      notes: visit.notes || "",
    })
    setIsEditVisitDialogOpen(true)
  }

  // Handle edit visit form submission
  const handleEditVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/update-visit/${selectedVisitId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editVisitData),
      })

      if (!response.ok) {
        throw new Error("Failed to update visit")
      }

      // Refresh visits data after update
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit?page=${currentVisitPage}&limit=${visitsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (res.ok) {
        const data = await res.json()
        setVisitsData(data)
      }

      toast.success("Visit updated successfully")
    } catch (error) {
      // console.error("Error updating visit:", error)
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsEditVisitDialogOpen(false)
    }
  }

  const handleOpenStatusModal = (visit: VisitData) => {
    setSelectedVisitId(visit._id)
    setStatusForm({
      status: visit.status,
      notes: "",
    })
    setIsStatusModalOpen(true)
  }

  const handleStatusChange = async () => {
    if (!statusForm.status) {
      toast.error("Please select a status")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visits/update-visit-status/${selectedVisitId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusForm),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refresh visits data after update
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/get-all-visit?page=${currentVisitPage}&limit=${visitsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (res.ok) {
        const data = await res.json()
        setVisitsData(data)
      }

      toast.success("Status updated successfully")
      setIsStatusModalOpen(false)
      setStatusForm({ status: "", notes: "" })
      setSelectedVisitId("")
    } catch (error) {
      // console.error("Error updating status:", error)
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Extract time from date for display
  const extractTime = (dateString: string) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error extracting time:", error)
      return ""
    }
  }

  const fetchRevenueData = async (range: string) => {
    setIsRevenueLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/metrics/revenue-growth?range=${range}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      const data: RevenueGrowthResponse = await response.json()
      setRevenueData(data.data)
    } catch (err) {
      console.error("Error fetching revenue data:", err)
    } finally {
      setIsRevenueLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (chartRef.current) {
      try {
        toast.info("Generating PDF...")
        const canvas = await html2canvas(chartRef.current)
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("l", "mm", "a4")
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save("revenue-growth.pdf")
        toast.success("PDF downloaded successfully")
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast.error("Failed to generate PDF")
      }
    }
  }

  const getTimeRangeParam = (timeframe: string) => {
    switch (timeframe) {
      case "12months":
        return "1y"
      case "30days":
        return "30d"
      case "7days":
        return "7d"
      default:
        return "1y"
    }
  }

  useEffect(() => {
    if (activeTab === "overview") {
      fetchRevenueData(getTimeRangeParam(chartTimeframe))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, chartTimeframe, token])

  const handleUserPageChange = (page: number) => {
    if (page >= 1 && page <= totalUserPages) {
      setCurrentUserPage(page)
    }
  }

  const handleVisitPageChange = (page: number) => {
    if (page >= 1 && page <= totalVisitPages) {
      setCurrentVisitPage(page)
    }
  }

  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsNotificationsLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch notifications")
        }

        const data = await res.json()
        setNotifications(data.data)
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (err) {
        console.error("Error fetching notifications:", err)
        // toast.error(err instanceof Error ? err.message : String(err))
        // setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsNotificationsLoading(false)
      }
    }

    fetchNotifications()
  }, [token])

  return (
    <div className="p-4 ">
      <PageHeader title="Admin Name" />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-full p-1 mb-6 inline-flex mt-2">
          <TabsList className="">
            <TabsTrigger
              value="overview"
              className={`rounded-full px-6 py-2 ${activeTab === "overview" ? "bg-[#091057] text-white" : ""}`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className={`rounded-full px-6 py-2 ${activeTab === "users" ? "bg-[#091057] text-white" : ""}`}
            >
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="visits"
              className={`rounded-full px-6 py-2 ${activeTab === "visits" ? "bg-[#091057] text-white" : ""}`}
            >
              Visits
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Total Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-bold text-navy-900">{metricsData?.totalVisits}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-green-600">
                    <Users className="h-5 w-5" />
                  </div>
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-bold text-navy-900">{metrics.activeUsers}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  Pending Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-bold text-navy-900">{metrics.pendingVisits}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Visits & Revenue Trends</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant={chartTimeframe === "12months" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full text-xs ${chartTimeframe === "12months" ? "bg-blue-950" : ""}`}
                        onClick={() => setChartTimeframe("12months")}
                      >
                        12 Months
                      </Button>
                      <Button
                        variant={chartTimeframe === "30days" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full text-xs ${chartTimeframe === "30days" ? "bg-blue-950" : ""}`}
                        onClick={() => setChartTimeframe("30days")}
                      >
                        30 Days
                      </Button>
                      <Button
                        variant={chartTimeframe === "7days" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full text-xs ${chartTimeframe === "7days" ? "bg-blue-950" : ""}`}
                        onClick={() => setChartTimeframe("7days")}
                      >
                        7 Days
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={exportToPDF}
                      disabled={isRevenueLoading || revenueData.length === 0}
                    >
                      <FileText className="h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4" ref={chartRef}>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500">Revenue Growth</div>
                      <div className="text-xl font-bold">
                        {isRevenueLoading
                          ? "Loading..."
                          : revenueData.length > 0
                            ? `$${revenueData[revenueData.length - 1]?.revenue.toLocaleString()}`
                            : "$0"}
                      </div>
                    </div>
                    <div className="h-64">
                      {isRevenueLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart className="p-1" data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => {
                                const date = new Date(value)
                                return `${date.toLocaleString("default", {
                                  month: "short",
                                })}`
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
                                const date = new Date(label)
                                return `${date.toLocaleString("default", {
                                  month: "long",
                                  year: "numeric",
                                })}`
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
                </CardContent>
              </Card>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 text-xs text-gray-500 pb-2">
                      <div>Name</div>
                      <div>Package</div>
                      {/* <div>Price</div> */}
                    </div>
                    {recentData?.data.map((activity, index) => (
                      <div key={index} className="grid grid-cols-2 items-center">
                        <div className="text-sm font-medium">{activity?.user?.fullname}</div>
                        <div className="text-sm">{activity?.plan?.name}</div>
                        {/* <div>
                          <span className={`px-2 py-1 rounded-full text-xs`}>{activity?.plan?.price}</span>
                        </div> */}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-1">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 sticky top-0 bg-white z-10 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>All Visits</CardTitle>
                    <div className="flex gap-2">
                      <Select
                        defaultValue="all"
                        value={overviewVisitStatusFilter}
                        onValueChange={handleOverviewVisitStatusFilterChange}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">View and manage all scheduled visits</div>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {isOverviewVisitsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
                      </div>
                    ) : visitsData?.data && visitsData.data.length > 0 ? (
                      visitsData.data.map((visit) => (
                        <div key={visit._id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <div
                            className={`w-2 self-stretch rounded-full ${visit.status.toLowerCase() === "completed"
                                ? "bg-green-500"
                                : visit.status.toLowerCase() === "cancelled"
                                  ? "bg-red-500"
                                  : visit.status.toLowerCase() === "confirmed"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                              }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm truncate">{visit.client.fullname}</h4>
                                <p className="text-xs text-gray-500 mt-1">{visit.address}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(visit.status)}`}>
                                {visit.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(visit.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {extractTime(visit.date)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs">
                                {visit.staff ? (
                                  <span className="text-gray-700">Staff: {visit.staff.fullname}</span>
                                ) : (
                                  <span className="text-gray-400">No staff assigned</span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleViewVisit(visit._id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No visits found</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2 sticky top-0 bg-white z-10 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[350px]">
                  {isNotificationsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <div key={index} className="border-b pb-3 last:border-b-0">
                          <div className="text-sm font-medium">{notification?.message}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                              {notification.displayUser?.fullname || "System"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {notification?.time?.includes("h")
                                ? notification.time
                                : formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No notifications found</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* User Management Tab Content */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-green-600">
                    <Users className="h-5 w-5" />
                  </div>
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-bold text-navy-900">{metrics.activeUsers}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  Total Security Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-navy-900">{metrics.totalSecurityStaff}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-red-600">
                    <Users className="h-5 w-5" />
                  </div>
                  Total Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-navy-900">{metrics.totalAdmin}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 bg-[#FFFFFF] py-[25px] px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search ....."
                  className="pl-9 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all" onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all" onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>S.No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell>{(currentUserPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{user.fullname}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(user.status)}`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination for Users */}
            {totalUserPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm">
                <div>
                  Showing {(currentUserPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentUserPage * itemsPerPage, totalUserPages * itemsPerPage)} of{" "}
                  {totalUserPages * itemsPerPage} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentUserPage === 1}
                    onClick={() => handleUserPageChange(currentUserPage - 1)}
                  >
                    <span className="sr-only">Previous page</span>
                    &lt;
                  </Button>
                  {Array.from({ length: totalUserPages }, (_, index) => index + 1).map((page) => (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      className={`h-8 w-8 p-0 ${currentUserPage === page ? "bg-yellow-100" : ""}`}
                      onClick={() => handleUserPageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentUserPage === totalUserPages}
                    onClick={() => handleUserPageChange(currentUserPage + 1)}
                  >
                    <span className="sr-only">Next page</span>
                    &gt;
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Visits Tab Content */}
        <TabsContent value="visits">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Total Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-bold text-navy-900">{metricsData?.totalVisits}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-green-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Completed Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-navy-900">{metricsData?.completedVisitCount}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <div className="mr-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-navy-900">{metricsData?.confirmedVisitCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, address..."
                className="pl-9 pr-4 py-2 w-full"
                defaultValue={visitSearchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all" onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assign Staff</TableHead>
                    <TableHead>Update Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitsData?.data && visitsData.data.length > 0 ? (
                    visitsData.data.map((visit) => (
                      <TableRow key={visit._id}>
                        <TableCell>{formatDate(visit.date)}</TableCell>
                        <TableCell>{extractTime(visit.date)}</TableCell>
                        <TableCell>{visit.address}</TableCell>
                        <TableCell>{visit?.client?.fullname}</TableCell>
                        <TableCell>{visit.staff?.fullname || "Not Assigned"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(visit.status)}`}>
                            {visit.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleEditVisit(visit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenStatusModal(visit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteVisit(visit._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleViewVisit(visit._id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        {isLoading ? "Loading visits..." : "No visits found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination for Visits */}
          {totalVisitPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <div>
                Showing {(currentVisitPage - 1) * visitsPerPage + 1} to{" "}
                {Math.min(currentVisitPage * visitsPerPage, totalVisitPages * visitsPerPage)} of{" "}
                {totalVisitPages * visitsPerPage} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentVisitPage === 1}
                  onClick={() => handleVisitPageChange(currentVisitPage - 1)}
                >
                  <span className="sr-only">Previous page</span>
                  &lt;
                </Button>
                {Array.from({ length: totalVisitPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${currentVisitPage === page ? "bg-yellow-100" : ""}`}
                    onClick={() => handleVisitPageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentVisitPage === totalVisitPages}
                  onClick={() => handleVisitPageChange(currentVisitPage + 1)}
                >
                  <span className="sr-only">Next page</span>
                  &gt;
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={editUserData.fullname}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      fullname: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={editUserData.password}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value: "admin" | "client" | "staff") =>
                    setEditUserData({ ...editUserData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Visit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
            <DialogDescription>Detailed information about the selected visit</DialogDescription>
          </DialogHeader>
          {specificVisit ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Client</h4>
                  <p className="text-sm">{specificVisit.client?.fullname}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Email</h4>
                  <p className="text-sm">{specificVisit.client?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Staff</h4>
                  <p className="text-sm">{specificVisit.staff?.fullname}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Date</h4>
                  <p className="text-sm">{formatDate(specificVisit.date || "")}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Address</h4>
                <p className="text-sm">{specificVisit.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(specificVisit.status || "")}`}>
                    {specificVisit.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Payment</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${specificVisit.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {specificVisit.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm">{specificVisit.notes || "No notes available"}</p>
              </div>

              {specificVisit.issues && specificVisit.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Issues</h4>
                  {specificVisit.issues.map((issue, index) => (
                    <div key={index} className="mb-3 p-3 border rounded-md">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <h5 className="text-xs font-medium">Place</h5>
                          <p className="text-sm">{issue.place}</p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium">Type</h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${issue.type === "warning" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {issue.type}
                          </span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h5 className="text-xs font-medium">Issue</h5>
                        <p className="text-sm">{issue.issue}</p>
                      </div>
                      <div className="mb-2">
                        <h5 className="text-xs font-medium">Notes</h5>
                        <p className="text-sm">{issue.notes}</p>
                      </div>
                      {issue.media && issue.media.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">Media</h5>
                          <div className="flex flex-wrap gap-2">
                            {issue.media.map((media, mediaIndex) => (
                              <div key={mediaIndex} className="relative">
                                {media.type === "photo" ? (
                                  <Image
                                    src={media.url || "/placeholder.svg"}
                                    alt="Issue media"
                                    className="h-16 w-16 object-cover rounded-md"
                                    width={64}
                                    height={64}
                                  />
                                ) : (
                                  <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-md">
                                    <a
                                      href={media.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 text-xs"
                                    >
                                      View Video
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">Loading visit details...</div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Visit Confirmation Dialog */}
      <Dialog open={isDeleteVisitDialogOpen} onOpenChange={setIsDeleteVisitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Visit Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteVisitDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteVisit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Dialog */}
      <Dialog open={isEditVisitDialogOpen} onOpenChange={setIsEditVisitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
            <DialogDescription>Update visit information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVisitSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="staff">Staff</Label>
                <Select
                  value={editVisitData.staff}
                  onValueChange={(value) => setEditVisitData({ ...editVisitData, staff: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Visit Type</Label>
                <Select
                  value={editVisitData.type}
                  onValueChange={(value) => setEditVisitData({ ...editVisitData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine check">Routine Check</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editVisitData.notes}
                  onChange={(e) =>
                    setEditVisitData({
                      ...editVisitData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add notes about this visit"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- START IMPLEMENTATION: Status Update Dialog --- */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Visit Status</DialogTitle>
            <DialogDescription>Update the status and add notes for this visit</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusForm.status}
                onValueChange={(value) => setStatusForm({ ...statusForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                placeholder="Add notes"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isSubmitting} className="bg-[#091057] hover:bg-[#091057]/80">
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --- END IMPLEMENTATION --- */}
    </div>
  )
}
