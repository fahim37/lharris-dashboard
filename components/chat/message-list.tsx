"use client";

import { useRef, useEffect } from "react";
import type { Message } from "@/types/chat";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageItem
          key={message._id || index}
          message={message}
          showAvatar={
            index === 0 || messages[index - 1].sender !== message.sender
          }
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
