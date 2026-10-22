import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const verifyRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_VERIFY_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const now = Date.now();
  const entry = verifyRateLimitMap.get(ip);

  if (entry && now < entry.resetTime) {
    if (entry.count >= MAX_VERIFY_ATTEMPTS) {
      return NextResponse.json(
        {
          error:
            "Too many verification attempts from this network. Please try again in 15 minutes.",
        },
        { status: 429 },
      );
    }
    entry.count += 1;
  } else {
    verifyRateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
  }

  try {
    const body = await req.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token required" },
        { status: 400 },
      );
    }

    const result = await verifyOtp(email, token);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    const status =
      error.message?.includes("expired") ||
      error.message?.includes("Invalid") ||
      error.message?.includes("attempts")
        ? 400
        : 500;
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status },
    );
  }
}

