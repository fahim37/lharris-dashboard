import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarWithStatusProps {
  src?: string;
  name?: string | null; // Make name optional and nullable
  status?: "online" | "offline";
  size?: "sm" | "md" | "lg";
}

export function AvatarWithStatus({
  src,
  name,
  status = "offline",
  size = "md",
}: AvatarWithStatusProps) {
  // Safe handling of name with fallback
  const safeName = name || "Unknown";

  // Safe initials generation
  const initials = safeName
    .split(" ")
    .filter(Boolean) // Remove any empty strings from split
    .map((n) => n[0] || "") // Handle empty strings in array
    .join("")
    .toUpperCase()
    .slice(0, 2); // Limit to 2 characters max

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const statusSizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={src || "/placeholder.svg"} alt={safeName} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            statusSizeClasses[size],
            status === "online" ? "bg-green-500" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
}
