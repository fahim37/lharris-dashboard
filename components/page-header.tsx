"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

interface PageHeaderProps {
  title?: string
  subtitle?: string
}

export function PageHeader({  }: PageHeaderProps) {
  const { data: session } = useSession()
  const user = session?.user
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="border-b p-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">User Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="text-lg font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="text-sm text-muted-foreground">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}