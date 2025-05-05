export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "staff";
}

export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  client: User;
  messages: Message[];
}
