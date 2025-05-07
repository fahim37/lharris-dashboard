import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string, chatId: string) => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    query: {
      token,
      chatId,
    },
    transports: ["websocket"],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
