import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicRoutes = ["/login"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isStatic = pathname.startsWith("/_next") || pathname.includes(".");

  // Redirect unauthenticated users trying to access protected routes
  if (!token && !isPublicRoute && !isStatic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from public routes
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Restrict /dashboard to admin only
  if (pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url)); // Or use a /403 page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
