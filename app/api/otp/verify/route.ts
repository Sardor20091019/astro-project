import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { MemoryRateLimiter, getClientIdentifier } from "@/lib/rate-limit";

const otpVerifyLimiter = new MemoryRateLimiter(10, 15 * 60 * 1000);

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req, "otp-verify");
  const rateCheck = otpVerifyLimiter.check(clientId, 10, 15 * 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many verification attempts from this network. Please try again in 15 minutes.",
      },
      { status: 429 },
    );
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

