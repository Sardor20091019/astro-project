import { NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email, turnstileToken } = await request.json(); 
    

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    const verifyData = await verifyRes.json();
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
    
  } catch (error: any) {
    console.error("OTP API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 429 });
  }
}