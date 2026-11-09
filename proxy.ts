import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
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


    // Strip any untrusted client-supplied internal headers to prevent spoofing
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-internal-secret");
    requestHeaders.delete("x-user-email");
    requestHeaders.delete("x-user-id");

    const identifier = token?.email || token?.id || (typeof token?.sub === "string" ? token.sub : "");
    if (identifier) {
      requestHeaders.set("x-user-email", identifier);
    }
    if (token?.id) {
      requestHeaders.set("x-user-id", token.id);
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
