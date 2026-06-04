import { NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

export async function POST(request: Request) {
  console.log("OTP API: Request received");
  
  try {
    const { email } = await request.json();
    
    // Get IP address reliably
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log(`OTP API: Attempting to send to ${email} for IP ${ip}`);

    await generateAndSendOtp(email, ip);

    console.log("OTP API: Success");
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("OTP API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}