"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Conversation, Message } from "@/types/chat";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { connectSocket, disconnectSocket } from "@/utils/socket";

export default function AdminChatPage() {
  const { data: session, status } = useSession();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated or not admin/staff
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     redirect("/login");
  //   } else if (
  //     session?.user?.role !== "admin" &&
  //     session?.user?.role !== "staff"
  //   ) {
  //     redirect("/chat");
  //   }
  // }, [session]);

  // Connect to socket when session is available
  useEffect(() => {
    if (session?.accessToken && activeConversation) {
      const socket = connectSocket(session.accessToken, activeConversation._id);

      socket.emit("joinRoom", activeConversation._id);

      socket.on("newMessage", (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage])
        console.log("newMessage", newMessage);}
      );

      return () => {
        disconnectSocket();
      };
    }
  }, [session?.accessToken, activeConversation]);

  // Load messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!session?.accessToken || !activeConversation) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/${activeConversation.client._id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        const data = await response.json();
        if (data.status) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [session?.accessToken, activeConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    // console.log(conversation);
    setActiveConversation(conversation);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!session?.accessToken || !activeConversation) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            message: messageText,
            chatId: activeConversation._id,
          }),
        }
      );

      const data = await response.json();
      if (data.status) {
        // Socket will handle adding the message to the UI
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-80 flex-shrink-0">
        <div className="h-16 border-b flex items-center px-4">
          <h1 className="font-semibold">Admin Dashboard</h1>
        </div>
        <ConversationList
          activeConversationId={activeConversation?._id || null}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="h-16 border-b flex items-center px-4">
              <div className="flex items-center gap-3">
                <AvatarWithStatus
                  name={activeConversation.client.name}
                  status="online"
                />
                <div>
                  <h2 className="font-medium">
                    {activeConversation.client.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeConversation.client.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <MessageList messages={messages} isLoading={isLoading} />
              </div>
              <MessageInput
                onSendMessage={handleSendMessage}
                chatId={activeConversation.client._id}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
