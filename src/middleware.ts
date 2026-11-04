import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Login page itself is public (needs to be accessible to log in)
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  // 2. Protect all other /admin/* routes (e.g., /admin/dashboard)
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;

    if (!(await isValidSession(session))) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware ONLY to admin paths
  matcher: ["/admin/:path*"],
};