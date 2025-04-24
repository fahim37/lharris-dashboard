interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="border-b p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full h-8 w-8 flex items-center justify-center border">
            <span className="sr-only">Notifications</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="text-xs font-medium">N</span>
            </div>
            <div className="text-sm">
              <div className="font-medium">Name</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
