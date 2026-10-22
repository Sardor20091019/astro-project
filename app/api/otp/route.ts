import { NextRequest, NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, turnstileToken } = body;

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verification token missing" },
        { status: 400 },
      );
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const verifyData = (await verifyRes.json()) as TurnstileResponse;
    if (!verifyData.success) {
      return NextResponse.json(
        { error: "Bot verification failed" },
        { status: 403 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await generateAndSendOtp(email, ip);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("OTP Send Error:", error);
    const status = error.message?.includes("Too many") ? 429 : 500;
    return NextResponse.json(
      { error: error.message || "An internal error occurred" },
      { status },
    );
  }
}

