import type { Message } from "@/types/chat"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"

interface MessageItemProps {
  message: Message
  showAvatar?: boolean
}

export function MessageItem({ message, showAvatar = true }: MessageItemProps) {
  const { data: session } = useSession()
  const isCurrentUser = message.sender === session?.user?.id

  const formattedTime = message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : ""

  return (
    <div className={`flex items-end gap-2 mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
            A
          </div>
        </div>
      )}

      <div className={`max-w-[70%] ${isCurrentUser ? "order-1" : "order-2"}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser ? "bg-primary text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {message.message}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  )
}
