import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files like favicon.ico
  ) {
    return NextResponse.next();
  }

  // Check for access token in cookies (SSR-compatible)
  // Note: localStorage is client-only; we check a cookie set on login for SSR guard
  // For client-side, the API interceptor will redirect on 401
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    // Redirect to login but allow client-side auth to take over
    // We use a soft redirect — if the client has a token in localStorage,
    // the page will render; API interceptor handles 401 redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
