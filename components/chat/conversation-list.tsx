"use client";

import { useState, useEffect } from "react";
import type { Conversation } from "@/types/chat";
import { useSession } from "next-auth/react";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationList({
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.accessToken) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/getallchat`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        const data = await response.json();
        if (data.status) {
          setConversations(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchConversations();
    }
  }, [session?.accessToken]);

  const sortedConversations = [...conversations].sort((a, b) => {
    const aLast = a.messages?.[a.messages.length - 1]?.createdAt ?? 0;
    const bLast = b.messages?.[b.messages.length - 1]?.createdAt ?? 0;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  const filteredConversations = sortedConversations.filter((conversation) => {
    const clientName = conversation?.client?.name || "";
    return clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full border-r">
      {/* Uncomment and style this search input if you want to enable search */}
      {/* <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Message....."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div> */}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const lastMessage =
              conversation.messages?.[conversation.messages.length - 1];
            const hasUnreadMessages = conversation.messages?.some(
              (msg) => !msg.read && msg.receiver === session?.user?.id
            );

            return (
              <div
                key={conversation._id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversationId === conversation._id ? "bg-gray-100" : ""
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <AvatarWithStatus
                    name={conversation.client?.email}
                    status="online"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">
                        {conversation.client?.email}
                      </h3>
                      {lastMessage?.createdAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(lastMessage.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                    {lastMessage?.message && (
                      <p
                        className={`text-sm truncate ${
                          hasUnreadMessages ? "font-medium" : "text-gray-500"
                        }`}
                      >
                        {lastMessage.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
