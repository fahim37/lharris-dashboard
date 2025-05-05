import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-[200px]" />
        ))}
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
}
