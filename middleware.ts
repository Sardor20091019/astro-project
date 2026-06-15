import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAdminPageRoute = req.nextUrl.pathname.startsWith("/admin");

    if ((isApiAdminRoute || isAdminPageRoute) && token?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};