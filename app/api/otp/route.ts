import { NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Extract real client IP securely through proxy headers
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