import { useSession } from "next-auth/react"

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({  subtitle }: PageHeaderProps) {
  const session = useSession()
  const user = session.data?.user
  console.log("Session data:", user);
  
  return (
    <div className="border-b p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium">{user?.name}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
         
          <div className="flex items-center gap-2">
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
    </div>
  )
}
