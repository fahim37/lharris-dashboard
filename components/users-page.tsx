"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { getAllUsers, addUser, updateUser, deleteUser } from "@/lib/api"

interface User {
  _id: string
  fullname: string
  email: string
  role: string
  status: string
  lastActive?: string
}

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "client",
  })
  const [editUser, setEditUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers()
      if (response.status && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      // Fallback to dummy data if API fails
      setUsers([
        {
          _id: "13560",
          fullname: "John Doe",
          email: "john.doe@royalhouse.com",
          role: "admin",
          status: "active",
          lastActive: "2025-04-22T10:30:00.000Z",
        },
        {
          _id: "11500",
          fullname: "Jane Doe",
          email: "jane.smith@royalhouse.com",
          role: "staff",
          status: "active",
          lastActive: "2025-04-23T08:30:00.000Z",
        },
        {
          _id: "12118",
          fullname: "Jane Smith",
          email: "jane.smith@royalhouse.com",
          role: "client",
          status: "active",
          lastActive: "2025-04-23T08:30:00.000Z",
        },
        {
          _id: "13617",
          fullname: "Jane Smith",
          email: "jane.smith@royalhouse.com",
          role: "client",
          status: "inactive",
          lastActive: "2025-04-20T14:30:00.000Z",
        },
      ])
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.includes(searchTerm)
    const matchesRole = selectedRole ? user.role === selectedRole.toLowerCase() : true
    const matchesStatus = selectedStatus ? user.status === selectedStatus.toLowerCase() : true

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddUser = async () => {
    try {
      await addUser(newUser)
      toast.success("User added successfully")
      setIsAddUserOpen(false)
      fetchUsers()
      // Reset form
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
    if (!currentUser) return

    try {
      await updateUser(currentUser._id, editUser)
      toast.success("User updated successfully")
      setIsEditUserOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast.success(`User deleted successfully`)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const formatLastActive = (lastActive?: string) => {
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Messages" subtitle="Manage users and communications" />

      <div className="p-4">
        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                  <TableRow key={user._id}>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.fullname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="bg-blue-950 text-white p-1 rounded-full mr-2">
                <Users className="h-5 w-5" />
              </div>
              Add User
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="fullname" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="fullname"
                placeholder="John Doe"
                value={newUser.fullname}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@royalmail.com"
                value={newUser.email}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={newUser.role} onValueChange={(value) => handleSelectChange("role", value, "new")}>
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
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
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
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-fullname" className="text-sm font-medium">
                Name
              </label>
              <Input id="fullname" value={editUser.fullname} onChange={(e) => handleInputChange(e, "edit")} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" value={editUser.email} onChange={(e) => handleInputChange(e, "edit")} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-password" className="text-sm font-medium">
                Password (leave blank to keep current)
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={editUser.password}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-role" className="text-sm font-medium">
                Role
              </label>
              <Select value={editUser.role} onValueChange={(value) => handleSelectChange("role", value, "edit")}>
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
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="bg-blue-950 hover:bg-blue-900" onClick={handleEditUser}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
