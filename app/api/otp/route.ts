import { NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function POST(request: Request) {
  try {
    const { email, turnstileToken } = await request.json() as { email?: string; turnstileToken?: string }; 

    if (!turnstileToken) {
      return NextResponse.json({ error: "Verification token missing" }, { status: 400 });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    const verifyData = await verifyRes.json() as TurnstileResponse;
    if (!verifyData.success) {
      return NextResponse.json({ error: "Bot verification failed" }, { status: 403 });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await generateAndSendOtp(email, ip);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("OTP API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}