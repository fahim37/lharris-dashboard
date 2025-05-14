"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Users, X } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

// Interfaces
interface User {
  _id: string
  fullname: string
  email: string
  role: string
  status: string
  lastActive?: string
}

interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

interface UserFormData {
  fullname: string
  email: string
  password: string
  role: string
}

interface FetchUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
}

const getAllUsers = async (token: string, params: FetchUsersParams): Promise<ApiResponse<User[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.search && params.search.trim() !== "") queryParams.append("search", params.search)
    if (params.role && params.role !== "all") queryParams.append("role", params.role)
    if (params.status && params.status !== "all") queryParams.append("status", params.status)

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/all-user?${queryParams.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

const addUser = async (userData: UserFormData, token: string): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/add-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

const updateUser = async (
  userId: string,
  userData: Partial<UserFormData>,
  token: string,
): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

const deleteUser = async (userId: string, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data: session, status } = useSession()
  const [newUser, setNewUser] = useState<UserFormData>({
    fullname: "",
    email: "",
    password: "",
    role: "client",
  })
  const [editUser, setEditUser] = useState<UserFormData>({
    fullname: "",
    email: "",
    password: "",
    role: "",
  })

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "authenticated" && session?.accessToken) {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedRole, selectedStatus, currentPage, status, session])

  const fetchUsers = async () => {
    if (!session?.accessToken) return

    setIsLoading(true)
    try {
      const response = await getAllUsers(session.accessToken, {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: selectedRole,
        status: selectedStatus,
      })

      if (response.status && response.data) {
        setUsers(response.data)
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage)
          setTotalPages(response.pagination.totalPages)
          setTotalItems(response.pagination.totalItems)
          setItemsPerPage(response.pagination.itemsPerPage)
        }
      } else {
        toast.error(response.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.error("Not authenticated")
      return
    }

    try {
      await addUser(newUser, session.accessToken)
      toast.success("User added successfully")
      setIsAddUserOpen(false)
      fetchUsers()
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "client",
      })
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Failed to add user")
    }
  }

  const handleEditUser = async () => {
    if (!currentUser || status !== "authenticated" || !session?.accessToken) {
      toast.error("Not authenticated or no user selected")
      return
    }

    try {
      await updateUser(currentUser._id, editUser, session.accessToken)
      toast.success("User updated successfully")
      setIsEditUserOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    }
  }

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete || status !== "authenticated" || !session?.accessToken) {
      toast.error("Not authenticated or no user selected")
      return
    }

    try {
      await deleteUser(userToDelete, session.accessToken)
      toast.success("User deleted successfully")
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const formatLastActive = (lastActive?: string): string => {
    if (!lastActive) return "Never"

    const date = new Date(lastActive)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHrs < 24) {
      return `${diffHrs}hr Ago`
    } else {
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays} Day${diffDays > 1 ? "s" : ""} Ago`
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, formType: "new" | "edit") => {
    const { id, value } = e.target
    if (formType === "new") {
      setNewUser((prev) => ({ ...prev, [id]: value }))
    } else {
      setEditUser((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string, formType: "new" | "edit") => {
    if (formType === "new") {
      setNewUser((prev) => ({ ...prev, [name]: value }))
    } else {
      setEditUser((prev) => ({ ...prev, [name]: value }))
    }
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    resetPagination()
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
    resetPagination()
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    resetPagination()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view this page.</div>
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Users" subtitle="Manage users and permissions" />

      <div className="p-4">
        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsAddUserOpen(true)} className="bg-blue-950 hover:bg-blue-900">
              + Add User
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatLastActive(user.lastActive)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentUser(user)
                              setEditUser({
                                fullname: user.fullname,
                                email: user.email,
                                password: "",
                                role: user.role,
                              })
                              setIsEditUserOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDeleteUser(user._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <div>
                Showing {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span className="sr-only">Previous page</span>&lt;
                </Button>

                {(() => {
                  // Calculate which page numbers to show
                  let pages = []
                  const maxVisiblePages = 5

                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if there are 5 or fewer
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1)
                  } else if (currentPage <= 3) {
                    // Near the start
                    pages = [1, 2, 3, 4, 5]
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end
                    pages = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
                  } else {
                    // In the middle
                    pages = Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                  }

                  return pages.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-950 text-white" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))
                })()}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="sr-only">Next page</span>&gt;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <div className="bg-blue-950 text-white p-1 rounded-full mr-2">
                <Users className="h-5 w-5" />
              </div>
              Add User
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddUserOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="fullname" className="text-sm font-medium">
                Name :
              </label>
              <Input
                id="fullname"
                placeholder=""
                value={newUser.fullname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email :
              </label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={newUser.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password :
              </label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role :
              </label>
              <Select value={newUser.role} onValueChange={(value: string) => handleSelectChange("role", value, "new")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-blue-950 hover:bg-blue-900" onClick={handleAddUser}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-blue-950 text-white p-1 rounded-full mr-2">
                <Users className="h-5 w-5" />
              </div>
              Edit User
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditUserOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-fullname" className="text-sm font-medium">
                Name :
              </label>
              <Input
                id="fullname"
                value={editUser.fullname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email" className="text-sm font-medium">
                Email :
              </label>
              <Input
                id="email"
                type="email"
                value={editUser.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-password" className="text-sm font-medium">
                Password (leave blank to keep current) :
              </label>
              <Input
                id="password"
                type="password"
                value={editUser.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-role" className="text-sm font-medium">
                Role :
              </label>
              <Select
                value={editUser.role}
                onValueChange={(value: string) => handleSelectChange("role", value, "edit")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-blue-950 hover:bg-blue-900" onClick={handleEditUser}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
