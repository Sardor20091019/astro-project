import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAdminPageRoute = req.nextUrl.pathname.startsWith("/admin");

    if (token?.role !== "ADMIN") {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (isAdminPageRoute) {
        return NextResponse.redirect(new URL("/?forbidden=1", req.url));
      }
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