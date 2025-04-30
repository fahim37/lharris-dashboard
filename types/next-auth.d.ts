import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isVerified: boolean;
      status: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    status: string;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isVerified: boolean;
      status: string;
    };
    accessToken: string;
  }
}
