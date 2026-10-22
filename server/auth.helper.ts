import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_SECRET =
  process.env.INTERNAL_API_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "fallback-astrospectrum-secret";

export function signCookie(val: string, secret = DEFAULT_SECRET): string {
  const sig = crypto
    .createHmac("sha256", secret)
    .update(val)
    .digest("base64")
    .replace(/=+$/, "");
  return `s:${val}.${sig}`;
}

export function unsignCookie(val: string, secret = DEFAULT_SECRET): string | false {
  if (typeof val !== "string" || !val.startsWith("s:")) return false;
  const str = val.slice(2);
  const dotIndex = str.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const rawValue = str.slice(0, dotIndex);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawValue)
    .digest("base64")
    .replace(/=+$/, "");
  const actualSig = str.slice(dotIndex + 1);
  if (
    expectedSig.length === actualSig.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(actualSig))
  ) {
    return rawValue;
  }
  return false;
}

export function parseCookieValue(rawVal: string | undefined): string | null {
  if (!rawVal) return null;
  if (rawVal.startsWith("s:")) {
    const unsigned = unsignCookie(rawVal);
    return unsigned ? unsigned : null;
  }
  return rawVal;
}

export async function getAuthenticatedUser(
  req?: NextRequest,
): Promise<{ id: string; email?: string | null; role?: string | null; name?: string | null } | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const dbUser = await db
      .selectFrom("User")
      .select(["id", "email", "role", "name"])
      .where("id", "=", session.user.id)
      .executeTakeFirst();
    if (dbUser) return dbUser;
  }

  if (req) {
    const cookieHeader = req.cookies.get("user_session")?.value;
    const resolvedId = parseCookieValue(cookieHeader);
    if (resolvedId) {
      const dbUser = await db
        .selectFrom("User")
        .select(["id", "email", "role", "name"])
        .where("id", "=", resolvedId)
        .executeTakeFirst();
      if (dbUser) return dbUser;
    }
  }

  return null;
}

export function resolveGuestToken(req: NextRequest): { token: string; isNew: boolean } {
  const rawCookie = req.cookies.get("astro_guest")?.value;
  const parsed = parseCookieValue(rawCookie);
  if (parsed) {
    return { token: parsed, isNew: false };
  }
  return { token: crypto.randomUUID(), isNew: true };
}

export function attachGuestCookie(res: NextResponse, token: string): void {
  const signed = signCookie(token);
  res.cookies.set("astro_guest", signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 31536000,
    path: "/",
  });
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db
    .selectFrom("User")
    .select("role")
    .where("id", "=", userId)
    .executeTakeFirst();
  return user?.role === "ADMIN";
}

