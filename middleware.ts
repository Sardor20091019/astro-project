import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAdminPageRoute = req.nextUrl.pathname.startsWith("/admin");

    if (token?.role !== "ADMIN") {
      if (isApiAdminRoute) {
        return NextResponse.json(
          { error: "Forbidden: Root clearance required" },
          { status: 403 }
        );
      }
      if (isAdminPageRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Attach signed internal verification headers to proxied backend admin calls
    const requestHeaders = new Headers(req.headers);
    if (token?.email) {
      requestHeaders.set("x-user-email", token.email);
    }
    if (process.env.NEXTAUTH_SECRET) {
      requestHeaders.set("x-internal-secret", process.env.NEXTAUTH_SECRET);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
