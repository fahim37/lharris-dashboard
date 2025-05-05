"use client";

import { setAuthToken } from "@/lib/api";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

function AuthTokenSetter() {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  return null; // This component doesn't render anything
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthTokenSetter />
      {children}
    </SessionProvider>
  );
}