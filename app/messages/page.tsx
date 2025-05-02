"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import socket from "@/utils/socket";

interface MessageType {
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const currentUserId = "123"; // Replace with actual user ID (e.g., from auth)

  useEffect(() => {
    socket.emit("join", currentUserId);

    socket.on("newMessage", (newMessage: MessageType) => {
      if (
        newMessage.sender === receiverId ||
        newMessage.receiver === receiverId
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [receiverId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get<{ data: MessageType[] }>(
        `/api/messages/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer token`, // Replace with actual token
          },
        }
      );
      setMessages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async () => {
    if (!message || !receiverId) return;
    try {
      const res = await axios.post<{ data: MessageType }>(
        `/api/messages`,
        { receiverId, message },
        {
          headers: {
            Authorization: `Bearer token`, // Replace with actual token
          },
        }
      );
      setMessages((prev) => [...prev, res.data.data]);
      setMessage("");
    } catch (err) {
      console.error("Message send error", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Messaging</h2>
      <input
        placeholder="Receiver ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />
      <button onClick={fetchMessages}>Load Messages</button>
      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <hr />
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>
            <strong>{msg.sender === currentUserId ? "You" : "Them"}:</strong>{" "}
            {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
